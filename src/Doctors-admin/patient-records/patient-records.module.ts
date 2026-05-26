import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PatientRecord, PatientRecordSchema } from "./Schemas/patient-record";
import { PatientRecordsController } from "./patient-records.controller";
import { PatientRecordsService } from "./patient-records.service";
import { DiagnosisReport, DiagnosisReportSchema } from "../diagnosis-reports/Schemas/report";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PatientRecord.name, schema: PatientRecordSchema },
            { name: DiagnosisReport.name, schema: DiagnosisReportSchema }
        ])
    ],
    controllers: [PatientRecordsController],
    providers: [PatientRecordsService],
    exports: [PatientRecordsService]
})
export class PatientRecordsModule {}
