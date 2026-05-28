import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Doctor, DoctorSchema } from '../Doctors/Schemas/doctor.schema';
import { Reception, ReceptionSchema } from '../reception/Schemas/reception.schema';
import { Patients, PatientsSchema } from '../patients/Schemas/patients.schema';
import { AdminAppointment, AdminAppointmentSchema } from '../admin-appointments/Schemas/admin-appointment.schema';
import { Hospital, HospitalSchema } from '../user/admin-user/schemas/hospital.schema';
import { AdminUser, AdminUserSchema } from '../user/admin-user/schemas/admin-user.schema';
import { ReceptionistAppointment, ReceptionistAppointmentSchema } from '../receptionist-admin/appointment/Schemas/receptionist-appointment';
import { PatientQueue, PatientQueueSchema } from '../receptionist-admin/patient-queue/Schema/patient-queue.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Reception.name, schema: ReceptionSchema },
      { name: Patients.name, schema: PatientsSchema },
      { name: AdminAppointment.name, schema: AdminAppointmentSchema },
      { name: Hospital.name, schema: HospitalSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: ReceptionistAppointment.name, schema: ReceptionistAppointmentSchema },
      { name: PatientQueue.name, schema: PatientQueueSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
