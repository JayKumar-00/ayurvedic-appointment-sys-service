import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { QueuesModule } from './queues/queues.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AssignmentModule } from './assignments/assignments.module';
import { DoctorModule } from './Doctors/doctor.module';
import { ReceptionModule } from './reception/reception.module';
import { TherapiesModule } from './Therapies/therapies.module';
import { PatientsModule } from './patients/patients.module';
import { AdminAppointmentModule } from './admin-appointments/admin-appointment.module';
import { ReceptionistAppointmentModule } from './receptionist-admin/appointment/receptionist-appointment.module';
import { PreMedicalTestModule } from './receptionist-admin/pre-medical-test/pre-medical-test.module';
import { PatientQueueModule } from './receptionist-admin/patient-queue/patient-queue.module';
import { MedicineDispensingModule } from './receptionist-admin/medicine-dispensing/medicine-dispensing.module';
import { PatientRegisterModule } from './receptionist-admin/patient-register/patient-register.module';
import { DiagnosisReportModule } from './Doctors-admin/diagnosis-reports/report.module';
import { PatientRecordsModule } from './Doctors-admin/patient-records/patient-records.module';
import { SidebarMenuModule } from './Sidebar-menu/sidebar-menu.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Inventory } from './inventory/Schema/inventory';
import { InventoryModule } from './inventory/inventory.module';
import { PrescriptionModule } from './Prescription-pdf/prescription.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongoUri,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    AppointmentsModule,
    AssignmentModule,
    DoctorModule,
    ReceptionModule,
    TherapiesModule,
    PatientsModule,
    AdminAppointmentModule,
    ReceptionistAppointmentModule,
    PreMedicalTestModule,
    PatientQueueModule,
    MedicineDispensingModule,
    PatientRegisterModule,
    DiagnosisReportModule,
    PatientRecordsModule,
    SidebarMenuModule,
    InventoryModule,
    PrescriptionModule,
    WebsocketModule,
    QueuesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
