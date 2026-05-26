import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceptionistAppointmentController } from './receptionist-appointment.controller';
import { ReceptionistAppointmentService } from './receptionist-appointment.service';
import { ReceptionistAppointment, ReceptionistAppointmentSchema } from './Schemas/receptionist-appointment';
import { AuthModule } from 'src/auth/auth.module';
import { ReceptionLevelGuard } from 'src/auth/guards/reception-level.guard';
import { PatientQueue, PatientQueueSchema } from '../patient-queue/Schema/patient-queue.schema';
import { PreMedicalTest, PreMedicalTestSchema } from '../pre-medical-test/Schemas/pre-medical-test';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ReceptionistAppointment.name, schema: ReceptionistAppointmentSchema },
      { name: PatientQueue.name, schema: PatientQueueSchema },
      { name: PreMedicalTest.name, schema: PreMedicalTestSchema }
    ]),
  ],
  controllers: [ReceptionistAppointmentController],
  providers: [ReceptionistAppointmentService, ReceptionLevelGuard],
  exports: [ReceptionistAppointmentService]
})
export class ReceptionistAppointmentModule {}

