import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Doctor, DoctorSchema } from '../Doctors/Schemas/doctor.schema';
import { Reception, ReceptionSchema } from '../reception/Schemas/reception.schema';
import { Patients, PatientsSchema } from '../patients/Schemas/patients.schema';
import { AdminAppointment, AdminAppointmentSchema } from '../admin-appointments/Schemas/admin-appointment.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Reception.name, schema: ReceptionSchema },
      { name: Patients.name, schema: PatientsSchema },
      { name: AdminAppointment.name, schema: AdminAppointmentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
