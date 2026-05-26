import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PatientRecord, PatientRecordDocument } from "./Schemas/patient-record";
import { CreatePatientRecordDto } from "./dto/create-patient-record.dto";
import { DiagnosisReport, DiagnosisReportDocument } from "../diagnosis-reports/Schemas/report";

@Injectable()
export class PatientRecordsService {
    private readonly logger = new Logger(PatientRecordsService.name);

    constructor(
        @InjectModel(PatientRecord.name)
        private readonly patientRecordModel: Model<PatientRecordDocument>,
        @InjectModel(DiagnosisReport.name)
        private readonly diagnosisReportModel: Model<DiagnosisReportDocument>
    ) {}

    async createOrUpdate(dto: CreatePatientRecordDto) {
        try {
            this.logger.log(`Recording patient record: ${JSON.stringify(dto)}`);
            let record: PatientRecordDocument | null = null;

            if (dto.appointmentId) {
                record = await this.patientRecordModel.findOne({ appointmentId: dto.appointmentId }).exec();
            }

            if (record) {
                this.logger.log(`Updating existing record for appointment: ${dto.appointmentId}`);
                record.patientName = dto.patientName;
                record.phone = dto.phone;
                record.age = dto.age;
                record.gender = dto.gender;
                record.condition = dto.condition;
                record.observation = dto.observation;
                record.date = dto.date;
                await record.save();
                return record;
            } else {
                this.logger.log(`Creating new patient record`);
                const newRecord = await this.patientRecordModel.create(dto);
                return newRecord;
            }
        } catch (error: any) {
            this.logger.error(`Error recording patient record: ${error.message}`);
            throw error;
        }
    }

    async findAll() {
        try {
            this.logger.log(`Fetching all patient records`);
            const records = await this.patientRecordModel.find().sort({ createdAt: -1 }).exec();
            
            // Resolve conditions dynamically if they are 'N/A'
            const resolvedRecords = await Promise.all(records.map(async (record) => {
                if (record.condition === 'N/A' && record.appointmentId) {
                    const report = await this.diagnosisReportModel.findOne({ appointmentId: record.appointmentId }).exec();
                    if (report && report.medicine) {
                        try {
                            const parsed = JSON.parse(report.medicine);
                            if (Array.isArray(parsed)) {
                                const conditions = parsed
                                    .map((m: any) => m.reason)
                                    .filter((reason: any) => typeof reason === 'string' && reason.trim() !== '' && reason.trim() !== 'General');
                                const uniqueConditions = Array.from(new Set(conditions));
                                if (uniqueConditions.length > 0) {
                                    const plainRecord = record.toObject();
                                    plainRecord.condition = uniqueConditions.join(', ');
                                    return plainRecord;
                                }
                            }
                        } catch (e) {
                            // Ignore JSON parse errors
                        }
                    }
                }
                return record;
            }));

            return resolvedRecords;
        } catch (error: any) {
            this.logger.error(`Error fetching patient records: ${error.message}`);
            throw error;
        }
    }
}
