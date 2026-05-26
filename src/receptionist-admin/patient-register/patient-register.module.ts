import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { PatientRegister } from "./Schema/patient-register";
import { PatientRegisterSchema } from "./Schema/patient-register";
import { PatientRegisterController } from "./patient-register.controller";
import { PatientRegisterService } from "./patient-register.service";


@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            {name:PatientRegister.name,schema:PatientRegisterSchema},
        ]),
    ],
    controllers:[PatientRegisterController],
    providers:[PatientRegisterService,ReceptionLevelGuard],
    exports:[PatientRegisterService]
})

export class PatientRegisterModule {}