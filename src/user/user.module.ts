import { Module } from '@nestjs/common';
import { AdminUserModule } from './admin-user/admin-user.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from './entity/user.entity';
import { StaffController } from './user.controller';
import { StaffService } from './user.service';
import { AdminLevelGuard } from './admin-user/guards/admin-level.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    AdminUserModule,
    RolePermissionModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, AdminLevelGuard],
  exports: [AdminUserModule, RolePermissionModule, StaffService],
})
export class UserModule {}
