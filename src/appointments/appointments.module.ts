import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { SystemAdminGuard } from '../user/admin-user/guards/system-admin.guard';
import { Staff, StaffSchema } from '../user/entity/user.entity';
import {
  Hospital,
  HospitalSchema,
} from '../user/admin-user/schemas/hospital.schema';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { AppointmentsController } from './appointments.controller';
import { AppointmentService } from './appointment.service';
import { RolePermissionModule } from '../user/role-permission/role-permission.module';
import { PermissionGuard } from '../user/role-permission/guards/permission.guard';
import { Role, RoleSchema } from '../user/role-permission/schemas/role.schema';

@Module({
  imports: [
    AuthModule,
    WebsocketModule,
    RolePermissionModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Hospital.name, schema: HospitalSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentService, SystemAdminGuard, PermissionGuard],
  exports: [AppointmentService],
})
export class AppointmentsModule {}
