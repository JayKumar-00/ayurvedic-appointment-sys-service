import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReceptionResponseDto } from "./dto/receptionist-appointment-response.dto";
import { CreateReceptionistAppointmentDto } from "./dto/create-receptionist-appointment.dto";
import { ReceptionistAppointment, ReceptionistAppointmentDocument } from "./Schemas/receptionist-appointment";
import { PatientQueue, PatientQueueDocument } from "../patient-queue/Schema/patient-queue.schema";
import { PreMedicalTest, PreMedicalTestDocument } from "../pre-medical-test/Schemas/pre-medical-test";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class ReceptionistAppointmentService {
  private readonly logger = new Logger(ReceptionistAppointmentService.name);
  constructor(
    @InjectModel(ReceptionistAppointment.name)
    private readonly receptionistAppointmentModel: Model<ReceptionistAppointmentDocument>,
    @InjectModel(PatientQueue.name)
    private readonly patientQueueModel: Model<PatientQueueDocument>,
    @InjectModel(PreMedicalTest.name)
    private readonly preMedicalTestModel: Model<PreMedicalTestDocument>,
  ) { }

  async createAppointment(createAppointmentDto: CreateReceptionistAppointmentDto, user?: JwtPayload) {
    try {
      this.logger.log(`Creating appointment with data: ${JSON.stringify(createAppointmentDto)}`)
      
      let hospitalId = createAppointmentDto.hospitalId;
      if (user && !user.isSystemAdmin) {
        if (!user.hospitalId) {
          throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
        }
        hospitalId = user.hospitalId;
      }

      const nameQuery: Record<string, any> = { patientName: createAppointmentDto.patientName };
      if (hospitalId) {
        nameQuery.hospitalId = hospitalId;
      }
      const existingAppointment = await this.receptionistAppointmentModel.findOne(nameQuery);
      if (existingAppointment) {
        throw new ConflictException('Appointment with this name already exists')
      }

      const phoneQuery: Record<string, any> = { phone: createAppointmentDto.phone };
      if (hospitalId) {
        phoneQuery.hospitalId = hospitalId;
      }
      const existingAppointmentByPhone = await this.receptionistAppointmentModel.findOne(phoneQuery);
      if (existingAppointmentByPhone) {
        throw new ConflictException('Appointment with this phone already exists')
      }

      const appointment = await this.receptionistAppointmentModel.create({
        patientName: createAppointmentDto.patientName,
        age: createAppointmentDto.age,
        gender: createAppointmentDto.gender,
        doctorName: createAppointmentDto.doctorName,
        date: createAppointmentDto.date,
        time: createAppointmentDto.time,
        phone: createAppointmentDto.phone,
        isActive: createAppointmentDto.isActive,
        visitReason: createAppointmentDto.visitReason,
        checkupType: createAppointmentDto.checkupType,
        hospitalId
      });

      try {
        await this.patientQueueModel.create({
          appointmentId: appointment._id,
          status: 'waiting',
          hospitalId
        });
      } catch (queueErr) {
        this.logger.error(`Failed to create patient queue entry automatically: ${queueErr.message}`);
      }

      return this.toAppointmentResponse(appointment);
    } catch (error) {
      throw this.handleServiceError(error, 'Error creating appointment')
    }
  }

  async findAllAppointments(user?: JwtPayload) {
    const query: Record<string, any> = {};
    if (user && !user.isSystemAdmin) {
      query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }
    const appointments = await this.receptionistAppointmentModel.find(query).exec();
    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(`No appointments found`);
    }
    return appointments.map(appointment => this.toAppointmentResponse(appointment));
  }

  async findOnePatient(id: string, user?: JwtPayload) {
    const query: Record<string, any> = { _id: id };
    if (user && !user.isSystemAdmin) {
      query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }
    const appointment = await this.receptionistAppointmentModel.findOne(query).exec()
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    const preMedQuery: Record<string, any> = { phone: appointment.phone };
    if (appointment.hospitalId) {
      preMedQuery.hospitalId = appointment.hospitalId;
    }
    const preMedicalTest = await this.preMedicalTestModel.findOne(preMedQuery).exec()
    return {
      ...this.toAppointmentResponse(appointment),
      preMedicalTest: preMedicalTest || null
    }
  }

  async changeAppointmentStatus(id: string, isActive: boolean, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const appointment = await this.receptionistAppointmentModel.findOne(query).exec()
      if (!appointment) {
        throw new NotFoundException(`Appointment with id ${id} not found`);
      }
      appointment.isActive = isActive;
      await appointment.save();

      return {
        message: `Appointment ${isActive ? 'activated' : 'deactivated'} successfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating appointment status')
    }
  }

  async updatePatientDetail(id: string, updateAppointmentsDto: Partial<CreateReceptionistAppointmentDto>, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const appointment = await this.receptionistAppointmentModel.findOne(query).exec()
      if (!appointment) {
        throw new NotFoundException(`Appointment with id ${id} not found`);
      }
      
      const oldPhone = appointment.phone;

      if (updateAppointmentsDto) {
        appointment.patientName = updateAppointmentsDto.patientName ?? appointment.patientName;
        appointment.doctorName = updateAppointmentsDto.doctorName ?? appointment.doctorName;
        appointment.phone = updateAppointmentsDto.phone ?? appointment.phone;
        appointment.age = updateAppointmentsDto.age ?? appointment.age;
        appointment.gender = updateAppointmentsDto.gender ?? appointment.gender;
        appointment.date = updateAppointmentsDto.date ?? appointment.date;
        appointment.time = updateAppointmentsDto.time ?? appointment.time;
        appointment.visitReason = updateAppointmentsDto.visitReason ?? appointment.visitReason;
        appointment.checkupType = updateAppointmentsDto.checkupType ?? appointment.checkupType;
      }
      
      await appointment.save()

      // Perform cascading update in PreMedicalTest if phone or patientName was modified
      if (updateAppointmentsDto.phone !== undefined || updateAppointmentsDto.patientName !== undefined) {
        try {
          const preMedQuery: Record<string, any> = { phone: oldPhone };
          if (appointment.hospitalId) {
            preMedQuery.hospitalId = appointment.hospitalId;
          }
          await this.preMedicalTestModel.updateMany(
            preMedQuery,
            {
              patientName: appointment.patientName,
              phone: appointment.phone
            }
          ).exec();
        } catch (preMedErr) {
          this.logger.error(`Failed to cascade updates to PreMedicalTest: ${preMedErr.message}`);
        }
      }

      return this.toAppointmentResponse(appointment)
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating appointment detail')
    }
  }

  async removeAppointments(id: string, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const appointment = await this.receptionistAppointmentModel.findOne(query).exec()
      if (!appointment) {
        throw new NotFoundException('Appointment not found')
      }
      await this.receptionistAppointmentModel.deleteOne(query).exec()

      // Also clean up patient queue for this appointment!
      try {
        await this.patientQueueModel.deleteOne({ appointmentId: appointment._id }).exec();
      } catch (queueErr) {
        this.logger.error(`Failed to delete queue entry during appointment deletion: ${queueErr.message}`);
      }

      return {
        message: 'Appointment deleted successfully'
      }
    } catch (err) {
      throw this.handleServiceError(err, 'Error deleting appointment')
    }
  }
  async findDoctorAppointments(doctorName:string, user?: JwtPayload){
    try{
      // patient queue se wahi entries find karenge jo read for doctor status me h 
      const query: Record<string, any> = { status: { $in: ['sent-to-doctor', 'with-doctor'] } };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }

      const queueEntries=await this.patientQueueModel.find(query).populate('appointmentId').exec()

      // sirf wahi appointments filter karenge jinka assigned doctorName matches 
      const filteredEntries=queueEntries.filter((entry)=>{
        const appointment=entry.appointmentId as any
        return appointment && appointment.doctorName===doctorName
      })

      //queue details aur appointment/premedical test data ko merge karenge 
      const combinedResults=await Promise.all(
        filteredEntries.map(async(entry)=>{
          const appointment=entry.appointmentId as any;
          //premedical data check phone number se verify karenge
          const preMedQuery: Record<string, any> = { phone: appointment.phone };
          if (appointment.hospitalId) {
            preMedQuery.hospitalId = appointment.hospitalId;
          }
          const premedicalTest=await this.preMedicalTestModel.findOne(preMedQuery).exec()

          return{
            _id: appointment._id.toString(),
            queueId: entry._id.toString(),
            patientName: premedicalTest?.patientName || appointment.patientName,
            doctorName: appointment.doctorName,
            phone: appointment.phone,
            age: appointment.age,
            gender: appointment.gender,
            date: appointment.date,
            time: appointment.time,
            isActive: appointment.isActive,
            visitReason: appointment.visitReason,
            checkupType: appointment.checkupType,
            status: entry.status, // e.g. sent-to-doctor / with-doctor
            // Vitals data queue ya premedical test se nikalenge
            bp: entry.Bp || premedicalTest?.Bp || null,
            bloodSugar: entry.bloodSugar || premedicalTest?.bloodSugar || null,
            weight: entry.Weight || premedicalTest?.Weight || null,
            height: premedicalTest?.Height || null,
            spo2: premedicalTest?.spo2 || null,
          }
        })
      )
      return combinedResults
    }catch(error){
      throw this.handleServiceError(error,'error finding doctor appointments')
    }
  }
  private toAppointmentResponse(appointment: any): ReceptionResponseDto {
    return {
      _id: appointment._id.toString(),
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      phone: appointment.phone,
      age: appointment.age,
      gender: appointment.gender,
      date: appointment.date,
      time: appointment.time,
      isActive: appointment.isActive,
      visitReason: appointment.visitReason,
      checkupType: appointment.checkupType,
      hospitalId: appointment.hospitalId
    }
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

  private handleServiceError(error: unknown, fallbackMessage: string): Error {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      return error as Error
    }

    if (this.isDuplicateKeyError(error)) {
      const duplicateMessage = this.getDuplicateKeyMessage(error)
      return new ConflictException(duplicateMessage)
    }

    const stack = error instanceof Error ? error.stack : undefined
    if (stack) {
      this.logger.error(fallbackMessage, stack)
    } else {
      this.logger.error(fallbackMessage)
    }
    return new InternalServerErrorException(fallbackMessage)
  }

  private isDuplicateKeyError(error: unknown): error is {
    code: number
    keyValue?: Record<string, unknown>;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    )
  }

  private getDuplicateKeyMessage(error: unknown): string {
    if (!this.isDuplicateKeyError(error) || !error.keyValue) {
      return 'Duplicate record exists'
    }
    const keys = Object.keys(error.keyValue)
    if (keys.includes('patientName')) {
      return 'User with this patient name already exists'
    }
    if (keys.includes('phone')) {
      return 'User with this phone number already exists'
    }

    return 'Duplicate record exists'
  }
}