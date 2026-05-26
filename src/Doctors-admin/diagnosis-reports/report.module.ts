import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { DiagnosisReportController } from "./report.controller";
import { DiagnosisReportService } from "./report.service";
import { DiagnosisReport, DiagnosisReportSchema } from "./Schemas/report";
import { StaffGuard } from "src/auth/guards/staff.guard";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: DiagnosisReport.name, schema: DiagnosisReportSchema }
        ]),
    ],
    controllers: [DiagnosisReportController],
    providers: [DiagnosisReportService,StaffGuard],
    exports: [DiagnosisReportService]
})
export class DiagnosisReportModule {}
