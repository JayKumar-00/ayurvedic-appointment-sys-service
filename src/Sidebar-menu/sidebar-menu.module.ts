import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SidebarMenu, SidebarMenuSchema } from './Schema/sidebar-menu';
import { SidebarMenuController } from './sidebar-menu.controller';
import { SidebarMenuService } from './sidebar-menu.service';
import { Assignment, AssignmentSchema } from 'src/assignments/schemas/assignments.schema';
import { AdminUser, AdminUserSchema } from 'src/user/admin-user/schemas/admin-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SidebarMenu.name, schema: SidebarMenuSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: AdminUser.name, schema: AdminUserSchema }
    ])
  ],
  controllers: [SidebarMenuController],
  providers: [SidebarMenuService],
  exports: [SidebarMenuService],
})
export class SidebarMenuModule { }

