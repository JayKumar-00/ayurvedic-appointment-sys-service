import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PrescriptionController } from "./prescription-pdf.controller";
import { PrescriptionService } from "./prescription.service";
import { AuthModule } from "src/auth/auth.module";
import { DoctorLevelGuard } from "src/auth/guards/doctor-level.guard";
import { DiagnosisReport, DiagnosisReportSchema } from "src/Doctors-admin/diagnosis-reports/Schemas/report";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: DiagnosisReport.name, schema: DiagnosisReportSchema }
        ])
    ],
    controllers: [PrescriptionController],
    providers: [PrescriptionService, DoctorLevelGuard],
    exports: [PrescriptionService]
})
export class PrescriptionModule {}