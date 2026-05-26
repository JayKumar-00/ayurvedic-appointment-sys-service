import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReceptionResponseDto } from "./dto/receptionist-appointment-response.dto";
import { CreateReceptionistAppointmentDto } from "./dto/create-receptionist-appointment.dto";
import { ReceptionistAppointment, ReceptionistAppointmentDocument } from "./Schemas/receptionist-appointment";
import { PatientQueue, PatientQueueDocument } from "../patient-queue/Schema/patient-queue.schema";
import { PreMedicalTest, PreMedicalTestDocument } from "../pre-medical-test/Schemas/pre-medical-test";

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

  async createAppointment(createAppointmentDto: CreateReceptionistAppointmentDto) {
    try {
      this.logger.log(`Creating appointment with data: ${JSON.stringify(createAppointmentDto)}`)
      
    
      
      const existingAppointment = await this.receptionistAppointmentModel.findOne({
        patientName: createAppointmentDto.patientName
      })
      if (existingAppointment) {
        throw new ConflictException('Appointment with this name already exists')
      }

      const existingAppointmentByPhone = await this.receptionistAppointmentModel.findOne({
        phone: createAppointmentDto.phone
      })
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
        checkupType: createAppointmentDto.checkupType
      });

      try {
        await this.patientQueueModel.create({
          appointmentId: appointment._id,
          status: 'waiting'
        });
      } catch (queueErr) {
        this.logger.error(`Failed to create patient queue entry automatically: ${queueErr.message}`);
        
      }

      return this.toAppointmentResponse(appointment);
    } catch (error) {
      throw this.handleServiceError(error, 'Error creating appointment')
    }
  }

  async findAllAppointments() {
    const appointments = await this.receptionistAppointmentModel.find().exec();
    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(`No appointments found`);
    }
    return appointments.map(appointment => this.toAppointmentResponse(appointment));
  }

  async findOnePatient(id: string) {
    const appointment = await this.receptionistAppointmentModel.findById(id).exec()
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    const preMedicalTest = await this.preMedicalTestModel.findOne({ phone: appointment.phone }).exec()
    return {
      ...this.toAppointmentResponse(appointment),
      preMedicalTest: preMedicalTest || null
    }
  }

  async changeAppointmentStatus(id: string, isActive: boolean) {
    try {
      const appointment = await this.receptionistAppointmentModel.findById(id).exec()
      if (!appointment) {
        throw new NotFoundException(`Appointment with id ${id} not found`);
      }
      await this.receptionistAppointmentModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec()

      return {
        message: `Appointment ${isActive ? 'activated' : 'deactivated'} successfully`,
      }
    } catch (error) {
      throw this.handleServiceError(error, 'Error updating appointment status')
    }
  }

  async updatePatientDetail(id: string, updateAppointmentsDto: Partial<CreateReceptionistAppointmentDto>) {
    try {
      const appointment = await this.receptionistAppointmentModel.findById(id).exec()
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
          await this.preMedicalTestModel.updateMany(
            { phone: oldPhone },
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

  async removeAppointments(id: string) {
    try {
      const appointment = await this.receptionistAppointmentModel.findById(id).exec()
      if (!appointment) {
        throw new NotFoundException('Appointment not found')
      }
      await this.receptionistAppointmentModel.findByIdAndDelete(id).exec()

      return {
        message: 'Appointment deleted successfully'
      }
    } catch (err) {
      throw this.handleServiceError(err, 'Error deleting appointment')
    }
  }
  async findDoctorAppointments(doctorName:string){
    try{
      // patient queue se wahi entries find karenge jo read for doctor status me h 

      const queueEntries=await this.patientQueueModel.find({status:{$in:['sent-to-doctor','with-doctor']}}).populate('appointmentId').exec()

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

          const premedicalTest=await this.preMedicalTestModel.findOne({phone:appointment.phone}).exec()

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