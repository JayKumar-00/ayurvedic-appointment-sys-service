import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Doctor, DoctorSchema } from "./Schemas/doctor.schema";
import { AdminUser, AdminUserSchema } from "src/user/admin-user/schemas/admin-user.schema";
import { DoctorService } from "./doctor.service";
import { SystemAdminGuard } from "src/user/admin-user/guards/system-admin.guard";
import { DoctorController } from "./doctor.controller";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";

@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            {name:Doctor.name,schema:DoctorSchema},
            {name: AdminUser.name,schema:AdminUserSchema}
        ])
    ],
    controllers:[DoctorController],
    providers:[DoctorService,AdminLevelGuard],
    exports:[DoctorService]
})

export class DoctorModule{}