import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePatientRegisterDto } from "./dto/create-patient-register.dto";
import { UpdatePatientRegisterDto } from "./dto/update-patient-register.dto";
import { PatientRegister, PatientRegisterDocument } from "./Schema/patient-register";
import { PatientRegisterResponseDto } from "./dto/patient-register-response.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";


@Injectable()
export class PatientRegisterService {
    private readonly logger = new Logger(PatientRegisterService.name)
    constructor(
        @InjectModel(PatientRegister.name)
        private readonly patientRegisterModel:Model<PatientRegisterDocument>,
    ){}


    async createPatientRegister(createPatientRegister:CreatePatientRegisterDto, user?: JwtPayload){
        try{
            let hospitalId = createPatientRegister.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
                }
                hospitalId = user.hospitalId;
            }

            const nameQuery: Record<string, any> = { fullName: createPatientRegister.fullName };
            if (hospitalId) {
                nameQuery.hospitalId = hospitalId;
            }
            const existingPatientRegister=await this.patientRegisterModel.findOne(nameQuery);
            if(existingPatientRegister){
                throw new ConflictException('Patient Register already exists')
            }

            const phoneQuery: Record<string, any> = { phone: createPatientRegister.phone };
            if (hospitalId) {
                phoneQuery.hospitalId = hospitalId;
            }
            const existingPatientRegisterByPhone=await this.patientRegisterModel.findOne(phoneQuery);
            if(existingPatientRegisterByPhone){
                throw new ConflictException('Patient Register already exists')
            }

            const patientRegister=await this.patientRegisterModel.create({
                fullName:createPatientRegister.fullName,
                phone:createPatientRegister.phone,
                email:createPatientRegister.email,
                age:createPatientRegister.age,
                gender:createPatientRegister.gender,
                bloodGroup:createPatientRegister.bloodGroup,
                status:createPatientRegister.status,
                hospitalId
            })
            return this.toPatientRegisterResponse(patientRegister)
        }
        catch(error){
            throw this.handleServiceError(error,'Error creating patient register')
        }
    }

    async findAllPatientRegister(user?: JwtPayload) {
    const query: Record<string, any> = {};
    if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }
    const patientRegister = await this.patientRegisterModel.find(query).exec();
    if (!patientRegister || patientRegister.length === 0) {
      throw new NotFoundException(`No patient register found`);
    }
    return patientRegister.map(patientRegister => this.toPatientRegisterResponse(patientRegister));
  }

  async findOnePatientRegister(id: string, user?: JwtPayload) {
    const query: Record<string, any> = { _id: id };
    if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }
    const patientRegister = await this.patientRegisterModel.findOne(query).exec()
    if (!patientRegister) {
      throw new NotFoundException(`Patient register with id ${id} not found`);
    }
    return this.toPatientRegisterResponse(patientRegister)
  }

  async changePatientRegisterStatus(id: string, status: boolean, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const patientRegister = await this.patientRegisterModel.findOne(query).exec()
      if (!patientRegister) {
        throw new NotFoundException(`Patient register with id ${id} not found`);
      }
      patientRegister.status = status;
      await patientRegister.save();

      return {
        message: `Patient register ${status ? 'activated' : 'deactivated'} successfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating patient register status')
    }
  }

  async updatePatientRegister(id: string, updatePatientRegisterDto: UpdatePatientRegisterDto, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const patientRegister = await this.patientRegisterModel.findOne(query).exec()
      if (!patientRegister) {
        throw new NotFoundException(`Patient register with id ${id} not found`);
      }
      
      const oldPhone = patientRegister.phone;

      if (updatePatientRegisterDto) {
        patientRegister.fullName = updatePatientRegisterDto.fullName ?? patientRegister.fullName;
        patientRegister.email = updatePatientRegisterDto.email ?? patientRegister.email;
        patientRegister.phone = updatePatientRegisterDto.phone ?? patientRegister.phone;
        patientRegister.age = updatePatientRegisterDto.age ?? patientRegister.age;
        patientRegister.gender = updatePatientRegisterDto.gender ?? patientRegister.gender;
        patientRegister.bloodGroup = updatePatientRegisterDto.bloodGroup ?? patientRegister.bloodGroup;
        patientRegister.status = updatePatientRegisterDto.status ?? patientRegister.status;
      }
      
      await patientRegister.save()

      return this.toPatientRegisterResponse(patientRegister)
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating patient register detail')
    }
  }

  async removePatientRegister(id: string, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const patientRegister = await this.patientRegisterModel.findOne(query).exec()
      if (!patientRegister) {
        throw new NotFoundException('Patient register not found')
      }
      await this.patientRegisterModel.deleteOne(query).exec()

      return {
        message: 'Patient register deleted successfully'
      }
    } catch (err) {
      throw this.handleServiceError(err, 'Error deleting patient register')
    }
  }

  private toPatientRegisterResponse(patientRegister: any): PatientRegisterResponseDto {
    return {
      _id: patientRegister._id.toString(),
      fullName: patientRegister.fullName,
      phone: patientRegister.phone,
      email: patientRegister.email,
      age: patientRegister.age,
      gender: patientRegister.gender,
      bloodGroup: patientRegister.bloodGroup,
      status: patientRegister.status,
      hospitalId: patientRegister.hospitalId
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
