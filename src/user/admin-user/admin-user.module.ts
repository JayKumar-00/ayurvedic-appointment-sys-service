import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { Hospital, HospitalSchema } from './schemas/hospital.schema';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { SystemAdminGuard } from './guards/system-admin.guard';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService, SystemAdminGuard],
  exports: [AdminUserService],
})
export class AdminUserModule {}
