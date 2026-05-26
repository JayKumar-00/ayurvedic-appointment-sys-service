import { Injectable, Logger, NotFoundException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminAppointment, AdminAppointmentDocument } from './Schemas/admin-appointment.schema';
import { CreateAdminAppointmentDto } from './dto/create-admin-appointment.dto';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';
import { AdminAppointmentFilterDto } from './dto/admin-appointment-filter.dto';
import { AdminAppointmentResponseDto } from './dto/admin-appointment-response.dto';
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class AdminAppointmentService {
  private readonly logger = new Logger(AdminAppointmentService.name);
  constructor(
    @InjectModel(AdminAppointment.name)
    private readonly adminAppointmentModel: Model<AdminAppointmentDocument>
  ) { }

  async createAdminAppointment(createAdminAppointmentDto: CreateAdminAppointmentDto, user?: JwtPayload) {
    try {
      this.logger.log(`Creating appointment with data: ${JSON.stringify(createAdminAppointmentDto)}`)
      
      let hospitalId = createAdminAppointmentDto.hospitalId;
      if (user && !user.isSystemAdmin) {
        if (!user.hospitalId) {
          throw new BadRequestException('Your account is not associated with any hospital. Please contact a system administrator.');
        }
        hospitalId = user.hospitalId;
      }

      const adminAppointment = await this.adminAppointmentModel.create({
        patientName: createAdminAppointmentDto.patientName,
        doctorName: createAdminAppointmentDto.doctorName,
        type: createAdminAppointmentDto.type,
        date: createAdminAppointmentDto.date,
        time: createAdminAppointmentDto.time,
        isActive: createAdminAppointmentDto.isActive,
        hospitalId
      })
      return this.toAdminAppointmentResponse(adminAppointment);
    } catch (error) {
      throw this.handleServiceError(error, 'Error creating AdminAppointment')
    }
  }

  async findAllAdminAppointments(filter: AdminAppointmentFilterDto, user?: JwtPayload) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit

    const query: Record<string, any> = {}

    if (filter.search) {
      const searchRegex = { $regex: filter.search, $options: 'i' };
      query.$or = [
        { patientName: searchRegex },
        { doctorName: searchRegex },
        { type: searchRegex },
        { time: searchRegex }
      ]
    }
    
    if (filter.patientName) query.patientName = { $regex: filter.patientName, $options: 'i' }
    if (filter.doctorName) query.doctorName = { $regex: filter.doctorName, $options: 'i' }
    if (filter.type) query.type = { $regex: filter.type, $options: 'i' }
    if (filter.date) query.date = filter.date;
    if (filter.time) query.time = { $regex: filter.time, $options: 'i' }
    if (filter.isActive !== undefined) query.isActive = filter.isActive;

    if (user && !user.isSystemAdmin) {
      query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }

    this.logger.log(`Fetching admin appointment with query:${JSON.stringify(query)}`)

    const sortBy = this.safeSortField(
      filter.sortBy,
      ['createdAt', 'updatedAt', 'patientName', 'doctorName', 'type', 'date', 'time', 'isActive'],
      'createdAt'
    )

    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [adminAppointments, totalItems] = await Promise.all([
      this.adminAppointmentModel.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).exec(),
      this.adminAppointmentModel.countDocuments(query).exec()
    ]);

    return {
      data: adminAppointments.map((adminAppointment) => this.toAdminAppointmentResponse(adminAppointment)),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit
      }
    }
  }

  async findOneAdminAppointment(id: string) {
    const adminAppointment = await this.adminAppointmentModel.findById(id)
    if (!adminAppointment) {
      throw new NotFoundException(`Admin Appointment with id ${id} not found`);
    }
    return this.toAdminAppointmentResponse(adminAppointment)
  }

  async changeAdminAppointmentStatus(id: string, isActive: boolean) {
    try {
      const adminAppointment = await this.adminAppointmentModel.findById(id).exec()
      if (!adminAppointment) {
        throw new NotFoundException(`Admin Appointment with id ${id} not found`);
      }
      await this.adminAppointmentModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec()

      return {
        message: `Admin Appointment ${isActive ? 'activated' : 'deactivated'} Successfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating Admin Appointment Status')
    }
  }

  async updateAdminAppointmentDetail(id: string, updateAdminAppointmentDto: UpdateAdminAppointmentDto) {
    try {
      const adminAppointment = await this.adminAppointmentModel.findById(id).exec()
      if (!adminAppointment) {
        throw new NotFoundException(`Admin Appointment with id ${id} not found`);
      }
      if (updateAdminAppointmentDto) {
        adminAppointment.patientName = updateAdminAppointmentDto.patientName ?? adminAppointment.patientName;
        adminAppointment.doctorName = updateAdminAppointmentDto.doctorName ?? adminAppointment.doctorName;
        adminAppointment.type = updateAdminAppointmentDto.type ?? adminAppointment.type;
        adminAppointment.date = updateAdminAppointmentDto.date ?? adminAppointment.date;
        adminAppointment.time = updateAdminAppointmentDto.time ?? adminAppointment.time;
        adminAppointment.isActive = updateAdminAppointmentDto.isActive ?? adminAppointment.isActive;
      }
      await adminAppointment.save()

      return this.toAdminAppointmentResponse(adminAppointment)
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating appointment Detail')
    }
  }

  async removeAdminAppointment(id: string) {
    try {
      const adminAppointment = await this.adminAppointmentModel.findById(id).exec()
      if (!adminAppointment) {
        throw new NotFoundException('Admin Appointment not found')
      }
      await this.adminAppointmentModel.findByIdAndDelete(id).exec()

      return {
        message: 'Admin Appointment deleted successfully'
      }
    } catch (err) {
      throw this.handleServiceError(err, 'Error deleting Admin Appointment')
    }
  }

  private toAdminAppointmentResponse(adminAppointment: AdminAppointmentDocument): AdminAppointmentResponseDto {
    return {
      _id: adminAppointment._id.toString(),
      patientName: adminAppointment.patientName,
      doctorName: adminAppointment.doctorName,
      type: adminAppointment.type,
      date: adminAppointment.date,
      time: adminAppointment.time,
      isActive: adminAppointment.isActive,
      hospitalId: adminAppointment.hospitalId
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
      return 'Admin Appointment with this patient name already exists'
    }
    if (keys.includes('doctorName')) {
      return 'Admin Appointment with this doctor name already exists'
    }

    return 'Duplicate record exists'
  }
}