import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { PreMedicalTestController } from "./pre-medical-test.controller";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { PreMedicalTest, PreMedicalTestSchema } from "./Schemas/pre-medical-test";
import { PreMedicalTestService } from "./pre-medical-test.service";
import { PatientQueue, PatientQueueSchema } from "../patient-queue/Schema/patient-queue.schema";
import { ReceptionistAppointment, ReceptionistAppointmentSchema } from "../appointment/Schemas/receptionist-appointment";

@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            {name:PreMedicalTest.name,schema:PreMedicalTestSchema},
            {name:PatientQueue.name,schema:PatientQueueSchema},
            {name:ReceptionistAppointment.name,schema:ReceptionistAppointmentSchema}
        ]),
    ],
    controllers:[PreMedicalTestController],
    providers:[PreMedicalTestService,ReceptionLevelGuard],
    exports:[PreMedicalTestService]
    
})

export class PreMedicalTestModule{}