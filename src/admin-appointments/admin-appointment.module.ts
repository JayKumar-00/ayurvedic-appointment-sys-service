import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AdminAppointmentController } from './admin-appointment.controller';
import { AdminAppointmentService } from './admin-appointment.service';
import { AdminAppointment, AdminAppointmentSchema } from './Schemas/admin-appointment.schema';
import { AdminLevelGuard } from 'src/user/admin-user/guards/admin-level.guard';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: AdminAppointment.name, schema: AdminAppointmentSchema }
    ]),
  ],
  controllers: [AdminAppointmentController],
  providers: [AdminAppointmentService, AdminLevelGuard],
  exports: [AdminAppointmentService],
})
export class AdminAppointmentModule {}