import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DiagnosisReport, DiagnosisReportDocument } from "./Schemas/report";
import { InjectModel } from "@nestjs/mongoose";
import { CreateDiagnosisReportDto } from "./dto/create-report.dto";
import { DiagnosisReportResponseDto } from "./dto/report-response.dto";
import { Model } from "mongoose";
import { BadRequestException, ConflictException, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class DiagnosisReportService {
    private readonly logger = new Logger(DiagnosisReportService.name);

    constructor(
        @InjectModel(DiagnosisReport.name)
        private readonly diagnosisReportModel: Model<DiagnosisReportDocument>
    ) {}

    async createReport(reportDto: CreateDiagnosisReportDto) {
        try {
            this.logger.log(`Creating report with data: ${JSON.stringify(reportDto)}`);
            const report = await this.diagnosisReportModel.create({
                appointmentId: reportDto.appointmentId,
                patientName: reportDto.patientName,
                age: reportDto.age,
                gender: reportDto.gender,
                date: reportDto.date,
                Bp: reportDto.Bp,
                bloodSugar: reportDto.bloodSugar,
                weight: reportDto.weight,
                condition: reportDto.condition,
                symptoms: reportDto.symptoms,
                observation: reportDto.observation,
                medicine: reportDto.medicine,
                followUp: reportDto.followUp,
                assignTherapy: reportDto.assignTherapy,
            });
            this.logger.log(`Report created successfully`);
            return this.toReportResponse(report);
        } catch (error) {
            this.logger.error(`Error creating report: ${error.message}`);
            throw error;
        }
    }

    async findOneReport(id: string) {
        const report = await this.diagnosisReportModel.findById(id).exec();
        if (!report) {
            throw new NotFoundException(`report not found`);
        }
        return this.toReportResponse(report);
    }

    async updateReport(id: string, updateDiagnosisReportDto: Partial<CreateDiagnosisReportDto>) {
        try {
            const report = await this.diagnosisReportModel.findById(id).exec();
            if (!report) {
                throw new NotFoundException('report not found');
            }
            if (updateDiagnosisReportDto) {
                report.appointmentId = updateDiagnosisReportDto.appointmentId ?? report.appointmentId;
                report.patientName = updateDiagnosisReportDto.patientName ?? report.patientName;
                report.age = updateDiagnosisReportDto.age ?? report.age;
                report.gender = updateDiagnosisReportDto.gender ?? report.gender;
                report.date = updateDiagnosisReportDto.date ?? report.date;
                report.Bp = updateDiagnosisReportDto.Bp ?? report.Bp;
                report.bloodSugar = updateDiagnosisReportDto.bloodSugar ?? report.bloodSugar;
                report.weight = updateDiagnosisReportDto.weight ?? report.weight;
                report.condition = updateDiagnosisReportDto.condition ?? report.condition;
                report.symptoms = updateDiagnosisReportDto.symptoms ?? report.symptoms;
                report.observation = updateDiagnosisReportDto.observation ?? report.observation;
                report.medicine = updateDiagnosisReportDto.medicine ?? report.medicine;
                report.followUp = updateDiagnosisReportDto.followUp ?? report.followUp;
                report.assignTherapy = updateDiagnosisReportDto.assignTherapy ?? report.assignTherapy;
            }
            await report.save();
            this.logger.log(`Report updated successfully`);
            return this.toReportResponse(report);
        } catch (error) {
            this.logger.error(`Error updating report: ${error.message}`);
            throw error;
        }
    }

    async removeReport(id: string) {
        try {
            const report = await this.diagnosisReportModel.findById(id).exec();
            if (!report) {
                throw new NotFoundException('report not found');
            }
            await this.diagnosisReportModel.findByIdAndDelete(id).exec();
            return {
                message: 'report deleted successfully'
            };
        } catch (error) {
            this.logger.error(`Error deleting report: ${error.message}`);
            throw this.handleServiceError(error, 'Error deleting report');
        }
    }

    async findByAppointmentId(appointmentId: string) {
        try {
            const report = await this.diagnosisReportModel.findOne({ appointmentId }).exec();
            if (!report) {
                return null;
            }
            return this.toReportResponse(report);
        } catch (error) {
            this.logger.error(`Error finding report by appointment ID: ${error.message}`);
            throw error;
        }
    }

    async findByPatientName(patientName: string) {
        try {
            this.logger.log(`Finding reports for patient name: ${patientName}`);
            const reports = await this.diagnosisReportModel.find({ patientName }).sort({ date: -1 }).exec();
            return reports.map(report => this.toReportResponse(report));
        } catch (error) {
            this.logger.error(`Error finding reports by patient name: ${error.message}`);
            throw error;
        }
    }

    private toReportResponse(report: any): DiagnosisReportResponseDto {
        return {
            _id: report._id.toString(),
            appointmentId: report.appointmentId,
            patientName: report.patientName,
            age: report.age,
            gender: report.gender,
            date: report.date,
            Bp: report.Bp,
            bloodSugar: report.bloodSugar,
            weight: report.weight,
            condition: report.condition,
            symptoms: report.symptoms,
            observation: report.observation,
            medicine: report.medicine,
            followUp: report.followUp,
            assignTherapy: report.assignTherapy
        };
    }

    private safeSortField(
        requestedField: string | undefined,
        allowedFields: string[],
        fallbackField: string,
    ): string {
        if (!requestedField) {
            return fallbackField;
        }
        return allowedFields.includes(requestedField)
            ? requestedField
            : fallbackField;
    }

    private handleServiceError(error: unknown, fallbackMessage: string): Error {
        if (
            error instanceof BadRequestException ||
            error instanceof ConflictException ||
            error instanceof NotFoundException
        ) {
            return error as Error;
        }

        if (this.isDuplicateKeyError(error)) {
            const duplicateMessage = this.getDuplicateKeyMessage(error);
            return new ConflictException(duplicateMessage);
        }

        const stack = error instanceof Error ? error.stack : undefined;
        if (stack) {
            this.logger.error(fallbackMessage, stack);
        } else {
            this.logger.error(fallbackMessage);
        }
        return new InternalServerErrorException(fallbackMessage);
    }

    private isDuplicateKeyError(error: unknown): error is {
        code: number;
        keyValue?: Record<string, unknown>;
    } {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: number }).code === 11000
        );
    }

    private getDuplicateKeyMessage(error: unknown): string {
        if (!this.isDuplicateKeyError(error) || !error.keyValue) {
            return 'Duplicate record exists';
        }
        const keys = Object.keys(error.keyValue);
        if (keys.includes('patientName')) {
            return 'User with this patient name already exists';
        }
        if (keys.includes('phone')) {
            return 'User with this phone number already exists';
        }
        return 'Duplicate record exists';
    }
}
