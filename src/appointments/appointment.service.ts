import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import { Types, Model } from 'mongoose';
import type Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { REDIS_CLIENT } from '../redis/redis.service';
import { BullProducer } from '../bull/producers/bull.producer';
import { WebSocketGatewayHandler } from '../websocket/websocket.gateway';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';
import { AppointmentListResponseDto } from './dto/appointment-list.response.dto';
import { AppointmentResponseDto } from './dto/appointment.response.dto';
import { PreMedicalCheckupDto } from './dto/pre-medical-checkup.dto';
import { PrescriptionStepDto } from './dto/prescription-step.dto';
import { Staff, StaffDocument } from '../user/entity/user.entity';
import {
  Hospital,
  HospitalDocument,
} from '../user/admin-user/schemas/hospital.schema';

const LOCK_TTL_MS = 30_000;
const REMINDER_OFFSET_MS = 60 * 60 * 1000;

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(Hospital.name)
    private readonly hospitalModel: Model<HospitalDocument>,
    private readonly bullProducer: BullProducer,
    private readonly webSocketGateway: WebSocketGatewayHandler,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    actor?: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    const lockKey = this.buildLockKey(
      createAppointmentDto.doctorId,
      createAppointmentDto.appointmentDate,
      createAppointmentDto.timeSlot,
    );
    const lockToken = randomUUID();

    try {
      if (actor) {
        this.assertHospitalScope(actor, createAppointmentDto.hospitalId);
      }

      const lockAcquired = await this.redisClient.set(
        lockKey,
        lockToken,
        'PX',
        LOCK_TTL_MS,
        'NX',
      );

      if (lockAcquired !== 'OK') {
        throw new ConflictException(
          'Selected doctor slot is being booked. Please try again.',
        );
      }

      const appointmentDate = this.parseAppointmentDate(
        createAppointmentDto.appointmentDate,
      );
      const hospitalId = this.parseObjectId(createAppointmentDto.hospitalId);
      const doctorId = this.parseObjectId(createAppointmentDto.doctorId);

      const [hospital, doctor] = await Promise.all([
        this.hospitalModel.findById(hospitalId).exec(),
        this.staffModel.findById(doctorId).exec(),
      ]);

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      if (hospital.isActive === false) {
        throw new BadRequestException('Hospital is inactive');
      }

      if (doctor.isActive === false) {
        throw new BadRequestException('Doctor is inactive');
      }

      if (doctor.hospitalId.toString() !== hospitalId.toString()) {
        throw new ForbiddenException(
          'Doctor does not belong to the selected hospital',
        );
      }

      const existingAppointment = await this.appointmentModel.findOne({
        doctorId,
        hospitalId,
        appointmentDate,
        timeSlot: createAppointmentDto.timeSlot.trim(),
        status: { $in: ['pending', 'confirmed'] },
      });

      if (existingAppointment) {
        throw new ConflictException('Appointment slot already booked');
      }

      const appointment = await this.appointmentModel.create({
        patientDetails: createAppointmentDto.patientDetails,
        pastMedicalHistory: createAppointmentDto.pastMedicalHistory,
        doctorId,
        hospitalId,
        appointmentDate,
        timeSlot: createAppointmentDto.timeSlot.trim(),
        status: createAppointmentDto.status ?? 'pending',
        ...(actor?.sub ? { createdBy: this.parseObjectId(actor.sub) } : {}),
      });

      const response = this.toAppointmentResponse(appointment);

      const reminderJobId = this.getReminderJobId(response.id);
      this.webSocketGateway.emitAppointmentCreated(
        response.hospitalId,
        response,
      );
      await Promise.all([
        this.bullProducer.addNotificationJob({
          userId: doctorId.toString(),
          title: 'New appointment created',
          message: 'A new appointment has been scheduled.',
          metadata: {
            appointmentId: response.id,
            hospitalId: response.hospitalId,
          },
        }),
        this.scheduleReminderJob(response, reminderJobId),
      ]);

      return response;
    } catch (error) {
      throw this.handleError(error, 'Error creating appointment');
    } finally {
      await this.releaseLock(lockKey, lockToken);
    }
  }

  async getAppointments(
    filter: AppointmentFilterDto,
    actor: JwtPayload,
  ): Promise<AppointmentListResponseDto> {
    try {
      const scopedFilter = this.applyHospitalScope(filter, actor);
      const page = scopedFilter.page ?? 1;
      const limit = scopedFilter.limit ?? 10;
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = {};

      if (scopedFilter.search) {
        query.$or = [
          {
            'patientDetails.name': {
              $regex: scopedFilter.search,
              $options: 'i',
            },
          },
          {
            'patientDetails.phone': {
              $regex: scopedFilter.search,
              $options: 'i',
            },
          },
          { timeSlot: { $regex: scopedFilter.search, $options: 'i' } },
          { status: { $regex: scopedFilter.search, $options: 'i' } },
        ];
      }

      if (scopedFilter.hospitalId) {
        query.hospitalId = this.parseObjectId(scopedFilter.hospitalId);
      }

      if (scopedFilter.doctorId) {
        query.doctorId = this.parseObjectId(scopedFilter.doctorId);
      }

      if (scopedFilter.status) {
        query.status = scopedFilter.status;
      }

      if (scopedFilter.appointmentDate) {
        const { start, end } = this.getDateRange(scopedFilter.appointmentDate);
        query.appointmentDate = { $gte: start, $lte: end };
      }

      const sortBy = this.safeSortField(
        scopedFilter.sortBy,
        ['createdAt', 'updatedAt', 'appointmentDate', 'timeSlot', 'status'],
        'createdAt',
      );
      const sortOrder = scopedFilter.sortOrder === 'asc' ? 1 : -1;

      const [appointments, totalItems] = await Promise.all([
        this.appointmentModel
          .find(query)
          .populate({
            path: 'doctorId',
            select: 'name email phone hospitalId roleId isActive',
          })
          .populate('hospitalId', 'name code isActive')
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.appointmentModel.countDocuments(query),
      ]);

      return {
        data: appointments.map((appointment) =>
          this.toAppointmentResponse(appointment),
        ),
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (error) {
      throw this.handleError(error, 'Error fetching appointments');
    }
  }

  async updateAppointment(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    actor: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid appointment id provided');
      }

      const appointment = await this.appointmentModel.findById(id);

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      this.assertAppointmentScope(actor, appointment.hospitalId.toString());

      const nextHospitalId = updateAppointmentDto.hospitalId
        ? this.parseObjectId(updateAppointmentDto.hospitalId)
        : appointment.hospitalId;
      const nextDoctorId = updateAppointmentDto.doctorId
        ? this.parseObjectId(updateAppointmentDto.doctorId)
        : appointment.doctorId;
      const nextAppointmentDate = updateAppointmentDto.appointmentDate
        ? this.parseAppointmentDate(updateAppointmentDto.appointmentDate)
        : appointment.appointmentDate;
      const nextTimeSlot =
        updateAppointmentDto.timeSlot?.trim() ?? appointment.timeSlot;
      const nextStatus = updateAppointmentDto.status ?? appointment.status;

      if (
        !actor.isSystemAdmin &&
        (!actor.hospitalId || actor.hospitalId !== nextHospitalId.toString())
      ) {
        throw new ForbiddenException(
          'You can only update appointments in your assigned hospital',
        );
      }

      if (updateAppointmentDto.hospitalId || updateAppointmentDto.doctorId) {
        const doctor = await this.staffModel.findById(nextDoctorId).exec();
        const hospital = await this.hospitalModel
          .findById(nextHospitalId)
          .exec();

        if (!hospital) {
          throw new NotFoundException('Hospital not found');
        }

        if (!doctor) {
          throw new NotFoundException('Doctor not found');
        }

        if (doctor.hospitalId.toString() !== nextHospitalId.toString()) {
          throw new ForbiddenException(
            'Doctor does not belong to the selected hospital',
          );
        }
      }

      appointment.patientDetails =
        updateAppointmentDto.patientDetails ?? appointment.patientDetails;
      appointment.pastMedicalHistory =
        updateAppointmentDto.pastMedicalHistory ??
        appointment.pastMedicalHistory;
      appointment.doctorId = nextDoctorId;
      appointment.hospitalId = nextHospitalId;
      appointment.appointmentDate = nextAppointmentDate;
      appointment.timeSlot = nextTimeSlot;
      appointment.status = nextStatus;

      await appointment.save();

      const response = this.toAppointmentResponse(appointment);

      if (response.status === 'cancelled' || response.status === 'completed') {
        await this.bullProducer.removeReminderJob(
          this.getReminderJobId(response.id),
        );
      } else {
        await this.scheduleReminderJob(
          response,
          this.getReminderJobId(response.id),
        );
      }

      this.webSocketGateway.emitAppointmentUpdated(
        response.hospitalId,
        response,
      );

      return response;
    } catch (error) {
      throw this.handleError(error, 'Error updating appointment');
    }
  }

  async getAppointmentsById(id: string) {
    try {
      const appointment = await this.appointmentModel
        .findById(id)
        .populate('doctorId', 'name email phone')
        .populate('hospitalId', 'name code')
        .exec();

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return appointment;
    } catch (err) {
      throw this.handleError(err, 'Error fetching appointment by id');
    }
  }

  async savePreMedicalCheckup(
    appointmentId: string,
    dto: PreMedicalCheckupDto,
    actor: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.getAppointmentByIdOrThrow(appointmentId);
      this.assertAppointmentScope(actor, appointment.hospitalId.toString());

      const recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date();

      if (Number.isNaN(recordedAt.getTime())) {
        throw new BadRequestException('Invalid recordedAt provided');
      }

      appointment.preMedicalCheckup = {
        appointmentId: appointment.id,
        hospitalId: appointment.hospitalId.toString(),
        recordedBy: actor.sub,
        patientName: dto.patientName,
        age: dto.age,
        gender: dto.gender,
        chiefComplaint: dto.chiefComplaint,
        symptoms: dto.symptoms,
        triageLevel: dto.triageLevel,
        weight: dto.weight,
        height: dto.height,
        bp: dto.bp,
        pulseRate: dto.pulseRate,
        temperature: dto.temperature,
        spO2: dto.spO2,
        bloodSugar: dto.bloodSugar,
        painLevel: dto.painLevel,
        allergies: dto.allergies ?? [],
        currentMedications: dto.currentMedications ?? [],
        pastConditions: dto.pastConditions ?? [],
        familyHistory: dto.familyHistory ?? [],
        visitType: dto.visitType,
        notes: dto.notes,
        recordedAt: recordedAt.toISOString(),
      };

      await appointment.save();

      const response = this.toAppointmentResponse(appointment);
      this.webSocketGateway.emitAppointmentUpdated(
        response.hospitalId,
        response,
      );

      return response;
    } catch (error) {
      throw this.handleError(error, 'Error saving premedical checkup');
    }
  }

  async getPreMedicalDetails(appointmentId: string, actor: JwtPayload) {
    try {
      const appointment = await this.getAppointmentByIdOrThrow(appointmentId);

      return appointment;
    } catch (err) {
      throw this.handleError(err, 'Error fetching premedical details');
    }
  }

  async savePrescriptionStep(
    appointmentId: string,
    dto: PrescriptionStepDto,
    actor: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.getAppointmentByIdOrThrow(appointmentId);
      this.assertAppointmentScope(actor, appointment.hospitalId.toString());

      if (dto.revisitRequired && !dto.revisitDate) {
        throw new BadRequestException(
          'revisitDate is required when revisitRequired is true',
        );
      }

      if (!dto.revisitRequired && dto.revisitDate) {
        throw new BadRequestException(
          'revisitDate should not be provided when revisitRequired is false',
        );
      }

      appointment.prescription = {
        appointmentId: appointment.id,
        hospitalId: appointment.hospitalId.toString(),
        writtenBy: actor.sub,
        prescription: dto.prescription,
        medications: dto.medications ?? [],
        revisitRequired: dto.revisitRequired,
        revisitDate: dto.revisitDate ?? null,
        advice: dto.advice,
        writtenAt: new Date().toISOString(),
      };

      if (dto.revisitRequired) {
        appointment.status = 'confirmed';
      }

      await appointment.save();

      const response = this.toAppointmentResponse(appointment);
      this.webSocketGateway.emitAppointmentUpdated(
        response.hospitalId,
        response,
      );

      return response;
    } catch (error) {
      throw this.handleError(error, 'Error saving prescription step');
    }
  }

  async getAppointmentClinicalForm(
    appointmentId: string,
    actor: JwtPayload,
  ): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.appointmentModel
        .findById(appointmentId)
        .populate({
          path: 'doctorId',
          select: 'name email phone hospitalId roleId isActive',
        })
        .populate('hospitalId', 'name code isActive')
        .exec();

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      this.assertAppointmentScope(actor, appointment.hospitalId.toString());

      return this.toAppointmentResponse(appointment);
    } catch (error) {
      throw this.handleError(error, 'Error fetching appointment clinical form');
    }
  }

  private applyHospitalScope(
    filter: AppointmentFilterDto,
    actor: JwtPayload,
  ): AppointmentFilterDto {
    if (actor.isSystemAdmin) {
      return filter;
    }

    if (!actor.isAdmin) {
      throw new ForbiddenException(
        'Only SystemAdmin or Admin can access appointments',
      );
    }

    if (!actor.hospitalId) {
      throw new ForbiddenException('Admin user must have a hospital assigned');
    }

    return {
      ...filter,
      hospitalId: actor.hospitalId,
    };
  }

  private assertHospitalScope(actor: JwtPayload, hospitalId: string): void {
    if (actor.isSystemAdmin) {
      return;
    }

    if (actor.isAdmin && actor.hospitalId === hospitalId) {
      return;
    }

    throw new ForbiddenException(
      'Admin users can only perform actions in their assigned hospital',
    );
  }

  private assertAppointmentScope(actor: JwtPayload, hospitalId: string): void {
    if (actor.isSystemAdmin) {
      return;
    }

    if (!actor.hospitalId || actor.hospitalId !== hospitalId) {
      throw new ForbiddenException(
        'You can only access appointments in your assigned hospital',
      );
    }
  }

  private async scheduleReminderJob(
    appointment: AppointmentResponseDto,
    jobId: string,
  ): Promise<void> {
    const appointmentStart = this.resolveAppointmentStartDate(
      appointment.appointmentDate,
      appointment.timeSlot,
    );

    const reminderAt = new Date(
      appointmentStart.getTime() - REMINDER_OFFSET_MS,
    );
    const delay = Math.max(reminderAt.getTime() - Date.now(), 0);

    await this.bullProducer.addReminderJob(
      {
        appointmentId: appointment.id,
        userId: appointment.doctorId,
        reminderAt: reminderAt.toISOString(),
        metadata: {
          hospitalId: appointment.hospitalId,
          status: appointment.status,
        },
      },
      { delay, jobId },
    );
  }

  private getReminderJobId(appointmentId: string): string {
    return `appointment-reminder${appointmentId}`;
  }

  private buildLockKey(
    doctorId: string,
    appointmentDate: string,
    timeSlot: string,
  ): string {
    return `doctor:${doctorId}:slot:${appointmentDate}:${timeSlot}`;
  }

  private parseAppointmentDate(appointmentDate: string): Date {
    const date = new Date(appointmentDate);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid appointmentDate provided');
    }

    return date;
  }

  private getDateRange(dateValue: string): { start: Date; end: Date } {
    const date = this.parseAppointmentDate(dateValue);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private resolveAppointmentStartDate(
    appointmentDate: string,
    timeSlot: string,
  ): Date {
    const baseDate = new Date(appointmentDate);
    const timeMatch = timeSlot.match(/(\d{1,2}:\d{2})/);
    const timePart = timeMatch?.[1] ?? '00:00';
    const [hours, minutes] = timePart.split(':').map((value) => Number(value));

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  private parseObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid id provided: ${id}`);
    }

    return new Types.ObjectId(id);
  }

  private toAppointmentResponse(
    appointment: AppointmentDocument,
  ): AppointmentResponseDto {
    return {
      id: appointment.id,
      patientDetails: appointment.patientDetails as Record<string, unknown>,
      pastMedicalHistory: appointment.pastMedicalHistory,
      preMedicalCheckup: appointment.preMedicalCheckup,
      prescription: appointment.prescription,
      doctorId: this.resolveObjectIdString(appointment.doctorId),
      hospitalId: this.resolveObjectIdString(appointment.hospitalId),
      appointmentDate: appointment.appointmentDate.toISOString(),
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      createdBy: appointment.createdBy
        ? this.resolveObjectIdString(appointment.createdBy)
        : undefined,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }

  private async getAppointmentByIdOrThrow(
    appointmentId: string,
  ): Promise<AppointmentDocument> {
    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Invalid appointment id provided');
    }

    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  private resolveObjectIdString(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (value && typeof value === 'object' && '_id' in value) {
      return this.resolveObjectIdString((value as { _id?: unknown })._id);
    }

    if (value && typeof value === 'object' && 'toString' in value) {
      const stringified = (value as { toString: () => string }).toString();
      return stringified === '[object Object]' ? '' : stringified;
    }

    return '';
  }

  private safeSortField(
    requestedField: string | undefined,
    allowedFields: string[],
    fallbackField: string,
  ): string {
    if (!requestedField) {
      return fallbackField;
    }

    return allowedFields.includes(requestedField)
      ? requestedField
      : fallbackField;
  }

  private async releaseLock(lockKey: string, lockToken: string): Promise<void> {
    try {
      await this.redisClient.eval(
        'if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end',
        1,
        lockKey,
        lockToken,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to release lock ${lockKey}: ${(error as Error).message}`,
      );
    }
  }

  private handleError(error: unknown, fallbackMessage: string): Error {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException ||
      error instanceof ForbiddenException
    ) {
      return error;
    }

    const stack = error instanceof Error ? error.stack : undefined;
    if (stack) {
      this.logger.error(fallbackMessage, stack);
    } else {
      this.logger.error(fallbackMessage);
    }

    return new InternalServerErrorException(fallbackMessage);
  }
}
