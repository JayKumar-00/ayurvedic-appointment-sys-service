import { Body, Controller, Delete, Param, Patch, Post, UseGuards, Get } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOperation, ApiResponse, ApiTags, ApiConflictResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { StaffGuard } from "src/auth/guards/staff.guard";
import { DiagnosisReportResponseDto } from "./dto/report-response.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { CreateDiagnosisReportDto } from "./dto/create-report.dto";
import { UpdateDiagnosisReportDto } from "./dto/report-update.dto";
import { DiagnosisReportService } from "./report.service";

@ApiTags('Doctor-admin-DiagnosisReport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard)
@Controller('diagnosis-report')
export class DiagnosisReportController {
    constructor(private readonly diagnosisReportService: DiagnosisReportService) {}

    @Post()
    @ApiOperation({ summary: 'save investigation and diagnosis report' })
    @ApiResponse({ status: 201, description: 'report saved successfully', type: DiagnosisReportResponseDto })
    @ApiBadRequestResponse({ type: ApiErrorResponseDto })
    @ApiConflictResponse({ type: ApiErrorResponseDto })
    @ApiForbiddenResponse({ type: ApiErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
    createDiagnosisReport(@Body() createDto: CreateDiagnosisReportDto) {
        return this.diagnosisReportService.createReport(createDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get reports by id ' })
    @ApiResponse({ status: 200, description: 'reports fetched successfully', type: DiagnosisReportResponseDto })
    @ApiBadRequestResponse({ type: ApiErrorResponseDto })
    @ApiConflictResponse({ type: ApiErrorResponseDto })
    @ApiForbiddenResponse({ type: ApiErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
    findOne(@Param('id') id: string) {
        return this.diagnosisReportService.findOneReport(id);
    }

    @Get('appointment/:appointmentId')
    @ApiOperation({ summary: 'Get report by appointment ID' })
    @ApiResponse({ status: 200, description: 'report fetched successfully', type: DiagnosisReportResponseDto })
    @ApiBadRequestResponse({ type: ApiErrorResponseDto })
    @ApiConflictResponse({ type: ApiErrorResponseDto })
    @ApiForbiddenResponse({ type: ApiErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
    findByAppointment(@Param('appointmentId') appointmentId: string) {
        return this.diagnosisReportService.findByAppointmentId(appointmentId);
    }

    @Get('patient-history/:patientName')
    @ApiOperation({ summary: 'Get diagnosis reports by patient name' })
    @ApiResponse({ status: 200, description: 'reports fetched successfully', type: [DiagnosisReportResponseDto] })
    @ApiBadRequestResponse({ type: ApiErrorResponseDto })
    @ApiConflictResponse({ type: ApiErrorResponseDto })
    @ApiForbiddenResponse({ type: ApiErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
    findByPatientName(@Param('patientName') patientName: string) {
        return this.diagnosisReportService.findByPatientName(patientName);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update report details' })
    @ApiResponse({ status: 200, description: "reports details updated sucessfully", type: DiagnosisReportResponseDto })
    @ApiBadRequestResponse({ type: ApiErrorResponseDto })
    @ApiConflictResponse({ type: ApiErrorResponseDto })
    @ApiForbiddenResponse({ type: ApiErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDiagnosisReportDto,
    ) {
        return this.diagnosisReportService.updateReport(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'delete report details' })
    @ApiResponse({ status: 200, description: 'report deleted successfully', type: DiagnosisReportResponseDto })
    @ApiBadRequestResponse({ type: ApiErrorResponseDto })
    @ApiConflictResponse({ type: ApiErrorResponseDto })
    @ApiForbiddenResponse({ type: ApiErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
    deleteDiagnosisReport(@Param('id') id: string) {
        return this.diagnosisReportService.removeReport(id);
    }
}