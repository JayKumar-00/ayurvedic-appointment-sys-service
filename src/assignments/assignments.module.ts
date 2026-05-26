import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Assignment, AssignmentSchema } from "./schemas/assignments.schema";
import { SystemAdminGuard } from "src/user/admin-user/guards/system-admin.guard";
import { AssignmentsService } from "./assignments.service";
import { AssignmentController } from "./assignments.controller";
import { AdminUser, AdminUserSchema } from "src/user/admin-user/schemas/admin-user.schema";
import { Hospital, HospitalSchema } from "src/user/admin-user/schemas/hospital.schema";







@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            { name: Assignment.name, schema: AssignmentSchema },
            { name: AdminUser.name, schema: AdminUserSchema },
            { name: Hospital.name, schema: HospitalSchema }
        ])
    ],
    controllers:[AssignmentController],
    providers:[AssignmentsService,SystemAdminGuard],
    exports:[AssignmentsService],
    
})

export class AssignmentModule{}