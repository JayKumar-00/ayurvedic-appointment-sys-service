import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patients, PatientDocument } from './Schemas/patients.schema';
import { CreatePatientsDto } from './dto/create-patients.dto';
import { UpdatePatientsDto } from './dto/update.patients.dto';
import { PatientsFilterDto } from './dto/patients-filter.dto';
import { PatientsResponseDto } from './dto/patients-response.dto';
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);
  constructor(
    @InjectModel(Patients.name)
    private readonly patientModel: Model<PatientDocument>
  ) { }

  async createPatients(createPatientsDto: CreatePatientsDto, user?: JwtPayload) {
    try {
      this.logger.log(`Creating patient with data: ${JSON.stringify(createPatientsDto)}`)
      const existingPatientByName = await this.patientModel.findOne({
        name: createPatientsDto.name
      })
      if (existingPatientByName) {
        throw new ConflictException('Patient with this name already exists')
      }
      const existingPatientByEmail = await this.patientModel.findOne({
        email: createPatientsDto.email
      })
      if (existingPatientByEmail) {
        throw new ConflictException('Patient with this email already exists')
      }
      const existingPatientByPhone = await this.patientModel.findOne({
        phone: createPatientsDto.phone
      })
      if (existingPatientByPhone) {
        throw new ConflictException('Patient with this phone already exists')
      }

      let hospitalId = createPatientsDto.hospitalId;
      if (user && !user.isSystemAdmin) {
        if (!user.hospitalId) {
          throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
        }
        hospitalId = user.hospitalId;
      }

      const patients = await this.patientModel.create({
        name: createPatientsDto.name,
        email: createPatientsDto.email,
        phone: createPatientsDto.phone,
        age: createPatientsDto.age,
        gender: createPatientsDto.gender,
        bloodGroup: createPatientsDto.bloodGroup,
        appointmentDate: createPatientsDto.appointmentDate,
        isActive: createPatientsDto.isActive,
        hospitalId
      })
      return this.toPatientsResponse(patients);
    } catch (error) {

      throw this.handleServiceError(error, 'Error ceating patients')

      throw error;
    }
  }

  async findAllPatients(filter: PatientsFilterDto, user?: JwtPayload) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit

    const query: Record<string, any> = {}

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { phone: { $regex: filter.search, $options: 'i' } },
        { age: { $regex: filter.search, $options: 'i' } },
        { gender: { $regex: filter.search, $options: 'i' } },
        { bloodGroup: { $regex: filter.search, $options: 'i' } },
        { appointmentDate: { $regex: filter.search, $options: 'i' } },
        { isActive: { $regex: filter.search, $options: 'i' } }
      ]
    }
    if (filter.name) query.name = { $regex: filter.name, $options: 'i' }
    if (filter.email) query.email = { $regex: filter.email, $options: 'i' }
    if (filter.phone) query.phone = { $regex: filter.phone, $options: 'i' }
    if (filter.age) query.age = { $regex: filter.age, $options: 'i' }

    if (user && !user.isSystemAdmin) {
      query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }

    this.logger.log(`Fetching patients with query:${JSON.stringify(query)}`)

    const sortBy = this.safeSortField(
      filter.sortBy,
      ['createdAt', 'updatedAt', 'name', 'email', 'phone', 'age', 'gender', 'bloodGroup', 'appointmentDate', 'isActive'],
      'createdAt'
    )

    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [patients, totalItems] = await Promise.all([
      this.patientModel.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).exec(),
      this.patientModel.countDocuments(query).exec()
    ]);

    return {
      data: patients.map((patient) => this.toPatientsResponse(patient)),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        page,
        limit
      }
    }

  }

  async findOnePatient(id: string) {
    const patient = await this.patientModel.findById(id)
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
    return this.toPatientsResponse(patient)
  }

  async changePatientStatus(id: string, isActive: boolean) {
    try {
      const patient = await this.patientModel.findById(id).exec()
      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);

      }
      await this.patientModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec()

      return {
        message: `Patient ${isActive ? 'activated' : 'deactivated'} Sucessfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating Patient Status')
    }
  }
  async updatePatientDetail(id: string, updatePatientsDto: UpdatePatientsDto) {
    try {
      const patient = await this.patientModel.findById(id).exec()
      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }
      if (updatePatientsDto) {
        patient.name = updatePatientsDto.name ?? patient.name;
        patient.email = updatePatientsDto.email ?? patient.email;
        patient.phone = updatePatientsDto.phone ?? patient.phone;
        patient.age = updatePatientsDto.age ?? patient.age;
        patient.gender = updatePatientsDto.gender ?? patient.gender;
        patient.bloodGroup = updatePatientsDto.bloodGroup ?? patient.bloodGroup;
        patient.appointmentDate = updatePatientsDto.appointmentDate ?? patient.appointmentDate;
      }
      await patient.save()

      return this.toPatientsResponse(patient)
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating Patient Detail')
    }
  }
  async removePatients(id: string) {
    try {
      const patient = await this.patientModel.findById(id).exec()
      if (!patient) {
        throw new NotFoundException('Patient not found')
      }
      await this.patientModel.findByIdAndDelete(id).exec()

      return {
        message: 'Patient deleted successfully'
      }
    } catch (err) {
      throw this.handleServiceError(err, 'Error deleting patient')
    }
  }
  private toPatientsResponse(patient: PatientDocument): PatientsResponseDto {
    return {
      _id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      appointmentDate: patient.appointmentDate,
      isActive: patient.isActive,
      hospitalId: patient.hospitalId
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
    if (keys.includes('email')) {
      return 'User with this email already exists'
    }
    if (keys.includes('phone')) {
      return 'User with this phone already exists'
    }

    return 'Duplicate record exists'
  }
}