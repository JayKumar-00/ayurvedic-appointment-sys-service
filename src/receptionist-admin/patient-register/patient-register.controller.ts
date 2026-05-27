import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { CreatePatientRegisterDto } from "./dto/create-patient-register.dto";
import { UpdatePatientRegisterDto } from "./dto/update-patient-register.dto";
import { PatientRegisterResponseDto } from "./dto/patient-register-response.dto";
import { PatientRegisterService } from "./patient-register.service";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@ApiTags('Patient-register')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ReceptionLevelGuard)
@Controller('patient-register')
export class PatientRegisterController {
  constructor(
    private readonly patientRegisterService: PatientRegisterService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Patient Register' })
  @ApiResponse({ status: 201, description: 'Patient Register created successfully', type: PatientRegisterResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createMedicineDispensing(@Req() req: { user: JwtPayload }, @Body() createDto: CreatePatientRegisterDto) {
    return this.patientRegisterService.createPatientRegister(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patient register' })
  @ApiResponse({ status: 200, description: "Patient register fetched successfully", type: PatientRegisterResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findAllAppointments(@Req() req: { user: JwtPayload }) {
    return this.patientRegisterService.findAllPatientRegister(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient register by ID' })
  @ApiResponse({ status: 200, description: "Patient register fetched successfully", type: PatientRegisterResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findOne(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.patientRegisterService.findOnePatientRegister(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update patient register status (active/inactive)' })
  @ApiResponse({ status: 200, description: "Patient register status updated successfully", type: PatientRegisterResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateStatus(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.patientRegisterService.changePatientRegisterStatus(id, isActive, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient register details' })
  @ApiResponse({ status: 200, description: "Patient register details updated successfully", type: PatientRegisterResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  update(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateDto: UpdatePatientRegisterDto
  ) {
    return this.patientRegisterService.updatePatientRegister(id, updateDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an patient register' })
  @ApiResponse({ status: 200, description: "Patient register deleted successfully", type: PatientRegisterResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  deleteAppointments(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.patientRegisterService.removePatientRegister(id, req.user);
  }
}
