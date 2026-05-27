import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MedicineDispensingResponseDto } from "./dto/medicine-dispensing-response.dto";
import { MedicineDispensing, MedicineDispensingDocument } from "./Schema/medicine-despensing";
import { CreateMedicineDispensingDto } from "./dto/create-medicine-dispensing.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class MedicineDispensingService {
    private readonly logger = new Logger(MedicineDispensingService.name)
    constructor(
        @InjectModel(MedicineDispensing.name)
        private readonly medicineDispensingModel:Model<MedicineDispensingDocument>,
    ){}


    async createMedicineDispensing(createMedicineDispensing:CreateMedicineDispensingDto, user?: JwtPayload){
        try{
            let hospitalId = createMedicineDispensing.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
                }
                hospitalId = user.hospitalId;
            }

            const nameQuery: Record<string, any> = { patientName: createMedicineDispensing.patientName };
            if (hospitalId) {
                nameQuery.hospitalId = hospitalId;
            }
            const existingMedicineDispensing=await this.medicineDispensingModel.findOne(nameQuery);
            if(existingMedicineDispensing){
                throw new ConflictException('Medicine Dispensing already exists')
            }

            const phoneQuery: Record<string, any> = { phone: createMedicineDispensing.phone };
            if (hospitalId) {
                phoneQuery.hospitalId = hospitalId;
            }
            const existingMedicineDispensingByPhone=await this.medicineDispensingModel.findOne(phoneQuery);
            if(existingMedicineDispensingByPhone){
                throw new ConflictException('Medicine Dispensing already exists')
            }

            const medicineDispensing=await this.medicineDispensingModel.create({
                patientName:createMedicineDispensing.patientName,
                phone:createMedicineDispensing.phone,
                doctorDiagnosis:createMedicineDispensing.doctorDiagnosis,
                medicineName:createMedicineDispensing.medicineName,
                dosage:createMedicineDispensing.dosage,
                frequency:createMedicineDispensing.frequency,
                duration:createMedicineDispensing.duration,
                notes:createMedicineDispensing.notes,
                status:createMedicineDispensing.status,
                hospitalId
            })
            return this.toMedicineDispensingResponse(medicineDispensing)
        }
        catch(error){
            throw this.handleServiceError(error,'Error creating medicine dispensing')
        }
    }

    async findAllAppointments(user?: JwtPayload) {
    const query: Record<string, any> = {};
    if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }
    const medicineDispensing = await this.medicineDispensingModel.find(query).exec();
    if (!medicineDispensing || medicineDispensing.length === 0) {
      throw new NotFoundException(`No medicine dispensing found`);
    }
    return medicineDispensing.map(medicineDispensing => this.toMedicineDispensingResponse(medicineDispensing));
  }

  async findOnePatient(id: string, user?: JwtPayload) {
    const query: Record<string, any> = { _id: id };
    if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
    }
    const medicineDispensing = await this.medicineDispensingModel.findOne(query).exec()
    if (!medicineDispensing) {
      throw new NotFoundException(`Medicine dispensing with id ${id} not found`);
    }
    return this.toMedicineDispensingResponse(medicineDispensing)
  }

  async changeMedicineDispensingStatus(id: string, status: boolean, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const medicineDispensing = await this.medicineDispensingModel.findOne(query).exec()
      if (!medicineDispensing) {
        throw new NotFoundException(`Medicine dispensing with id ${id} not found`);
      }
      medicineDispensing.status = status;
      await medicineDispensing.save();

      return {
        message: `Medicine dispensing ${status ? 'activated' : 'deactivated'} successfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating medicine dispensing status')
    }
  }

  async updateMedicineDispensing(id: string, updateMedicineDispensingDto: Partial<CreateMedicineDispensingDto>, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const medicineDispensing = await this.medicineDispensingModel.findOne(query).exec()
      if (!medicineDispensing) {
        throw new NotFoundException(`Medicine dispensing with id ${id} not found`);
      }
      
      const oldPhone = medicineDispensing.phone;

      if (updateMedicineDispensingDto) {
        medicineDispensing.patientName = updateMedicineDispensingDto.patientName ?? medicineDispensing.patientName;
        medicineDispensing.phone = updateMedicineDispensingDto.phone ?? medicineDispensing.phone;
        medicineDispensing.doctorDiagnosis = updateMedicineDispensingDto.doctorDiagnosis ?? medicineDispensing.doctorDiagnosis;
        medicineDispensing.medicineName = updateMedicineDispensingDto.medicineName ?? medicineDispensing.medicineName;
        medicineDispensing.dosage = updateMedicineDispensingDto.dosage ?? medicineDispensing.dosage;
        medicineDispensing.frequency = updateMedicineDispensingDto.frequency ?? medicineDispensing.frequency;
        medicineDispensing.duration = updateMedicineDispensingDto.duration ?? medicineDispensing.duration;
        medicineDispensing.notes = updateMedicineDispensingDto.notes ?? medicineDispensing.notes;
      }
      
      await medicineDispensing.save()

      return this.toMedicineDispensingResponse(medicineDispensing)
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating medicine dispensing detail')
    }
  }

  async removeMedicineDispensing(id: string, user?: JwtPayload) {
    try {
      const query: Record<string, any> = { _id: id };
      if (user && !user.isSystemAdmin) {
        query.hospitalId = user.hospitalId || 'invalid_hospital_id';
      }
      const medicineDispensing = await this.medicineDispensingModel.findOne(query).exec()
      if (!medicineDispensing) {
        throw new NotFoundException('Medicine dispensing not found')
      }
      await this.medicineDispensingModel.deleteOne(query).exec()

      return {
        message: 'Medicine dispensing deleted successfully'
      }
    } catch (err) {
      throw this.handleServiceError(err, 'Error deleting medicine dispensing')
    }
  }

  private toMedicineDispensingResponse(medicineDispensing: any): MedicineDispensingResponseDto {
    return {
      _id: medicineDispensing._id.toString(),
      patientName: medicineDispensing.patientName,
      phone: medicineDispensing.phone,
      doctorDiagnosis: medicineDispensing.doctorDiagnosis,
      medicineName: medicineDispensing.medicineName,
      dosage: medicineDispensing.dosage,
      frequency: medicineDispensing.frequency,
      duration: medicineDispensing.duration,
      notes: medicineDispensing.notes,
      status: medicineDispensing.status,
      createdAt: medicineDispensing.createdAt,
      updatedAt: medicineDispensing.updatedAt,
      hospitalId: medicineDispensing.hospitalId,
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
