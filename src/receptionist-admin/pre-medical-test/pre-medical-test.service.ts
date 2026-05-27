import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PreMedicalTest, PreMedicalTestDocument } from "./Schemas/pre-medical-test";
import { CreatePreMedicalTestDto } from "./dto/create-pre-medical-test.dto";
import { UpdatePreMedicalTestDto } from "./dto/update-premedical-test.dto";
import { PreMedicalTestResponceDto } from "./dto/pre-medical-test-responce.dto";
import { PatientQueue, PatientQueueDocument } from "../patient-queue/Schema/patient-queue.schema";
import { ReceptionistAppointment, ReceptionistAppointmentDocument } from "../appointment/Schemas/receptionist-appointment";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class PreMedicalTestService{

    private readonly logger = new Logger(PreMedicalTestService.name);

    constructor(
        @InjectModel(PreMedicalTest.name)
        private readonly preMedicalTestModel: Model<PreMedicalTestDocument>,
        @InjectModel(PatientQueue.name)
        private readonly patientQueueModel: Model<PatientQueueDocument>,
        @InjectModel(ReceptionistAppointment.name)
        private readonly receptionistAppointmentModel: Model<ReceptionistAppointmentDocument>,
    ){}

    async createPreMedicalTest(createPreMedicalTestDto:CreatePreMedicalTestDto, user?: JwtPayload){
        try {
            let hospitalId = createPreMedicalTestDto.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
                }
                hospitalId = user.hospitalId;
            }

            const preMedicalTest= await this.preMedicalTestModel.create({
                patientName:createPreMedicalTestDto.patientName,
                phone:createPreMedicalTestDto.phone,
                Weight:createPreMedicalTestDto.Weight,
                Bp:createPreMedicalTestDto.Bp,
                Height:createPreMedicalTestDto.Height,
                spo2:createPreMedicalTestDto.spo2,
                bloodSugar:createPreMedicalTestDto.bloodSugar,
                painLevel:createPreMedicalTestDto.painLevel,
                pulseRate:createPreMedicalTestDto.pulseRate,
                symptoms:createPreMedicalTestDto.symptoms,
                allergies:createPreMedicalTestDto.allergies,
                medication:createPreMedicalTestDto.medication,
                notes:createPreMedicalTestDto.notes,
                status:createPreMedicalTestDto.status,
                hospitalId
            });

            try {
                // Find corresponding appointment by patient phone number
                const appQuery: Record<string, any> = { phone: createPreMedicalTestDto.phone };
                if (hospitalId) {
                    appQuery.hospitalId = hospitalId;
                }
                const appointment = await this.receptionistAppointmentModel.findOne(appQuery);
                if (appointment) {
                    // Update patient queue entry by appointmentId
                    await this.patientQueueModel.findOneAndUpdate(
                        { appointmentId: appointment._id, status: 'waiting' },
                        {
                            Weight: createPreMedicalTestDto.Weight,
                            Bp: createPreMedicalTestDto.Bp,
                            bloodSugar: createPreMedicalTestDto.bloodSugar,
                            notes: createPreMedicalTestDto.notes,
                            status: 'ready-for-doctor'
                        },
                        { new: true }
                    ).exec();
                } else {
                    this.logger.warn(`No active appointment found for phone ${createPreMedicalTestDto.phone} to update patient queue.`);
                }
            } catch (queueErr) {
                this.logger.error(`Failed to update patient queue vitals: ${queueErr.message}`);
            }

            return this.toPremedicalTestResponce(preMedicalTest);
        } catch (error) {
            throw this.handleServiceError(error,'Error creating pre-medical test');
        } 
    }

    async findAllPreMedicalTests(user?: JwtPayload){
        try {
            const query: Record<string, any> = {};
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const preMedicalTests= await this.preMedicalTestModel.find(query)
            if (!preMedicalTests || preMedicalTests.length === 0) {
                throw new Error('No pre-medical tests found')
            }
            return preMedicalTests.map((preMedicalTest) => this.toPremedicalTestResponce(preMedicalTest))
        } catch (error) {
            throw this.handleServiceError(error,'Error finding pre-medical tests')
        } 
    }

    async findOnePreMedicalTest(id:string, user?: JwtPayload){
        try{
            const query: Record<string, any> = { _id: id };
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const preMedicalTest = await this.preMedicalTestModel.findOne(query)
        if(!preMedicalTest){
            throw new Error('Pre-medical test not found')
        }
        return this.toPremedicalTestResponce(preMedicalTest)
        }catch(error){
            throw this.handleServiceError(error,'Error finding pre-medical test')
        }
    }

    async updatePreMedicalTest(id:string,updatePreMedicalTestDto:UpdatePreMedicalTestDto, user?: JwtPayload){
        try{
            const query: Record<string, any> = { _id: id };
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const preMedicalTest = await this.preMedicalTestModel.findOne(query)
            if(!preMedicalTest){
                throw new Error('Pre-medical test not found')
            }
            if(updatePreMedicalTestDto){
                preMedicalTest.patientName=updatePreMedicalTestDto.patientName ?? preMedicalTest.patientName;
                preMedicalTest.phone = updatePreMedicalTestDto.phone ?? preMedicalTest.phone;
                preMedicalTest.Weight = updatePreMedicalTestDto.Weight ?? preMedicalTest.Weight;
                preMedicalTest.Bp = updatePreMedicalTestDto.Bp ?? preMedicalTest.Bp;
                preMedicalTest.Height = updatePreMedicalTestDto.Height ?? preMedicalTest.Height;
                preMedicalTest.spo2 = updatePreMedicalTestDto.spo2 ?? preMedicalTest.spo2;
                preMedicalTest.bloodSugar = updatePreMedicalTestDto.bloodSugar ?? preMedicalTest.bloodSugar;
                preMedicalTest.painLevel = updatePreMedicalTestDto.painLevel ?? preMedicalTest.painLevel;
                preMedicalTest.pulseRate = updatePreMedicalTestDto.pulseRate ?? preMedicalTest.pulseRate;
                preMedicalTest.symptoms = updatePreMedicalTestDto.symptoms ?? preMedicalTest.symptoms;
                preMedicalTest.allergies = updatePreMedicalTestDto.allergies ?? preMedicalTest.allergies;
                preMedicalTest.medication = updatePreMedicalTestDto.medication ?? preMedicalTest.medication;
                preMedicalTest.notes = updatePreMedicalTestDto.notes ?? preMedicalTest.notes;
                preMedicalTest.status = updatePreMedicalTestDto.status ?? preMedicalTest.status;
            }
            await preMedicalTest.save()

            try {
                // Find corresponding appointment by patient phone number
                const appQuery: Record<string, any> = { phone: preMedicalTest.phone };
                if (preMedicalTest.hospitalId) {
                    appQuery.hospitalId = preMedicalTest.hospitalId;
                }
                const appointment = await this.receptionistAppointmentModel.findOne(appQuery);
                if (appointment) {
                    // Find queue entry matching the appointmentId and update
                    await this.patientQueueModel.findOneAndUpdate(
                        { appointmentId: appointment._id },
                        {
                            Weight: preMedicalTest.Weight,
                            Bp: preMedicalTest.Bp,
                            bloodSugar: preMedicalTest.bloodSugar,
                            notes: preMedicalTest.notes,
                            status: 'ready-for-doctor'
                        },
                        { new: true }
                    ).exec();
                } else {
                    this.logger.warn(`No active appointment found for phone ${preMedicalTest.phone} to update patient queue during update.`);
                }
            } catch (queueErr) {
                this.logger.error(`Failed to update patient queue vitals during update: ${queueErr.message}`);
            }

            return this.toPremedicalTestResponce(preMedicalTest)
        }catch(error){
            throw this.handleServiceError(error,'Error updating pre-medical test')
        }
    }

    async removePreMedicalTest(id:string, user?: JwtPayload){
        try{
            const query: Record<string, any> = { _id: id };
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const preMedicalTest = await this.preMedicalTestModel.findOne(query)
            if(!preMedicalTest){
                throw new Error('Pre-medical test not found')
            }
            await this.preMedicalTestModel.deleteOne(query)
            return{
                message:'Pre-medical test deleted successfully'
            }
        }catch(error){
            throw this.handleServiceError(error,'Error removing pre-medical test')
        }
    }
    async changePreMedicalTestStatus(id:string,status:boolean, user?: JwtPayload){
        try{
            const query: Record<string, any> = { _id: id };
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const preMedicalTest = await this.preMedicalTestModel.findOne(query)
            if(!preMedicalTest){
                throw new Error('Pre-medical test not found')
            }
            preMedicalTest.status = status;
            await preMedicalTest.save()
            return{
                message:`Pre-medical test status changed successfully`
            }
        }catch(error){
            throw this.handleServiceError(error,'Error changing pre-medical test status')
        }
    }

    private toPremedicalTestResponce(preMedicalTest:any):PreMedicalTestResponceDto{
        return {
            _id:preMedicalTest._id,
            patientName:preMedicalTest.patientName,
            phone:preMedicalTest.phone,
            Weight:preMedicalTest.Weight,
            Bp:preMedicalTest.Bp,
            Height:preMedicalTest.Height,
            spo2:preMedicalTest.spo2,
            bloodSugar:preMedicalTest.bloodSugar,
            painLevel:preMedicalTest.painLevel,
            pulseRate:preMedicalTest.pulseRate,
            symptoms:preMedicalTest.symptoms,
            allergies:preMedicalTest.allergies,
            medication:preMedicalTest.medication,
            notes:preMedicalTest.notes,
            status:preMedicalTest.status,
            hospitalId:preMedicalTest.hospitalId
        }
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