import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePatientRegisterDto } from "./dto/create-patient-register.dto";
import { UpdatePatientRegisterDto } from "./dto/update-patient-register.dto";
import { PatientRegister, PatientRegisterDocument } from "./Schema/patient-register";
import { PatientRegisterResponseDto } from "./dto/patient-register-response.dto";


@Injectable()
export class PatientRegisterService {
    private readonly logger = new Logger(PatientRegisterService.name)
    constructor(
        @InjectModel(PatientRegister.name)
        private readonly patientRegisterModel:Model<PatientRegisterDocument>,
    ){}


    async createPatientRegister(createPatientRegister:CreatePatientRegisterDto){
        try{
            const existingPatientRegister=await this.patientRegisterModel.findOne({
                fullName:createPatientRegister.fullName,
            })
            if(existingPatientRegister){
                throw new ConflictException('Patient Register already exists')
            }
            const existingPatientRegisterByPhone=await this.patientRegisterModel.findOne({
                phone:createPatientRegister.phone,
            })
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
            })
            return this.toPatientRegisterResponse(patientRegister)
        }
        catch(error){
            throw this.handleServiceError(error,'Error creating patient register')
        }
    }

    async findAllPatientRegister() {
    const patientRegister = await this.patientRegisterModel.find().exec();
    if (!patientRegister || patientRegister.length === 0) {
      throw new NotFoundException(`No patient register found`);
    }
    return patientRegister.map(patientRegister => this.toPatientRegisterResponse(patientRegister));
  }

  async findOnePatientRegister(id: string) {
    const patientRegister = await this.patientRegisterModel.findById(id).exec()
    if (!patientRegister) {
      throw new NotFoundException(`Patient register with id ${id} not found`);
    }
    return this.toPatientRegisterResponse(patientRegister)
  }

  async changePatientRegisterStatus(id: string, status: boolean) {
    try {
      const patientRegister = await this.patientRegisterModel.findById(id).exec()
      if (!patientRegister) {
        throw new NotFoundException(`Patient register with id ${id} not found`);
      }
      await this.patientRegisterModel.findByIdAndUpdate(id, { status: status }, { new: true }).exec()

      return {
        message: `Patient register ${status ? 'activated' : 'deactivated'} successfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating patient register status')
    }
  }

  async updatePatientRegister(id: string, updatePatientRegisterDto: UpdatePatientRegisterDto) {
    try {
      const patientRegister = await this.patientRegisterModel.findById(id).exec()
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

  async removePatientRegister(id: string) {
    try {
      const patientRegister = await this.patientRegisterModel.findById(id).exec()
      if (!patientRegister) {
        throw new NotFoundException('Patient register not found')
      }
      await this.patientRegisterModel.findByIdAndDelete(id).exec()

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
      status: patientRegister.status
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
