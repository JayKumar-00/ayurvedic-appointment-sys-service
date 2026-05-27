import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { CreateMedicineDispensingDto } from "./dto/create-medicine-dispensing.dto";
import { UpdateMedicineDispensingDto } from "./dto/update-medicine-dispensing.dto";
import { MedicineDispensingResponseDto } from "./dto/medicine-dispensing-response.dto";
import { MedicineDispensingService } from "./medicine-dispensing.service";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@ApiTags('medicine-dispensing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ReceptionLevelGuard)
@Controller('medicine-dispensing')
export class MedicineDispensingController {
  constructor(
    private readonly medicineDispensingService: MedicineDispensingService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Medicine Dispensing' })
  @ApiResponse({ status: 201, description: 'Medicine Dispensing created successfully', type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createMedicineDispensing(@Req() req: { user: JwtPayload }, @Body() createDto: CreateMedicineDispensingDto) {
    return this.medicineDispensingService.createMedicineDispensing(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicine dispensing' })
  @ApiResponse({ status: 200, description: "Medicine dispensing fetched successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findAllAppointments(@Req() req: { user: JwtPayload }) {
    return this.medicineDispensingService.findAllAppointments(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine dispensing by ID' })
  @ApiResponse({ status: 200, description: "Medicine dispensing fetched successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findOne(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.medicineDispensingService.findOnePatient(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update medicine dispensing status (active/inactive)' })
  @ApiResponse({ status: 200, description: "Medicine dispensing status updated successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateStatus(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.medicineDispensingService.changeMedicineDispensingStatus(id, isActive, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine dispensing details' })
  @ApiResponse({ status: 200, description: "Medicine dispensing details updated successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  update(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicineDispensingDto
  ) {
    return this.medicineDispensingService.updateMedicineDispensing(id, updateDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an medicine dispensing' })
  @ApiResponse({ status: 200, description: "Medicine dispensing deleted successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  deleteAppointments(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.medicineDispensingService.removeMedicineDispensing(id, req.user);
  }
}
