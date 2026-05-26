import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { CreateMedicineDispensingDto } from "./dto/create-medicine-dispensing.dto";
import { UpdateMedicineDispensingDto } from "./dto/update-medicine-dispensing.dto";
import { MedicineDispensingResponseDto } from "./dto/medicine-dispensing-response.dto";
import { MedicineDispensingService } from "./medicine-dispensing.service";

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
  createMedicineDispensing(@Body() createDto: CreateMedicineDispensingDto) {
    return this.medicineDispensingService.createMedicineDispensing(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicine dispensing' })
  @ApiResponse({ status: 200, description: "Medicine dispensing fetched successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findAllAppointments() {
    return this.medicineDispensingService.findAllAppointments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine dispensing by ID' })
  @ApiResponse({ status: 200, description: "Medicine dispensing fetched successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.medicineDispensingService.findOnePatient(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update medicine dispensing status (active/inactive)' })
  @ApiResponse({ status: 200, description: "Medicine dispensing status updated successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.medicineDispensingService.changeMedicineDispensingStatus(id, isActive);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine dispensing details' })
  @ApiResponse({ status: 200, description: "Medicine dispensing details updated successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicineDispensingDto
  ) {
    return this.medicineDispensingService.updateMedicineDispensing(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an medicine dispensing' })
  @ApiResponse({ status: 200, description: "Medicine dispensing deleted successfully", type: MedicineDispensingResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  deleteAppointments(@Param('id') id: string) {
    return this.medicineDispensingService.removeMedicineDispensing(id);
  }
}
