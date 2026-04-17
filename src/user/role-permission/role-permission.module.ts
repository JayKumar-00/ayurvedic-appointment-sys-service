import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module';
import { AdminUser, AdminUserSchema } from '../admin-user/schemas/admin-user.schema';
import { PermissionGuard } from './guards/permission.guard';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { Role, RoleSchema } from './schemas/role.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],
  controllers: [RolePermissionController],
  providers: [RolePermissionService, PermissionGuard],
  exports: [PermissionGuard, RolePermissionService],
})
export class RolePermissionModule {}
