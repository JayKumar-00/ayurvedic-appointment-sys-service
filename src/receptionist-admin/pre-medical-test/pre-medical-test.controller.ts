import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { StaffGuard } from "src/auth/guards/staff.guard";
import { PreMedicalTestService } from "./pre-medical-test.service";
import { PreMedicalTestResponceDto } from "./dto/pre-medical-test-responce.dto";
import { CreatePreMedicalTestDto } from "./dto/create-pre-medical-test.dto";
import { UpdatePreMedicalTestDto } from "./dto/update-premedical-test.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";

@ApiTags('PreMedicalTest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pre-medical-test')
export class PreMedicalTestController{
    constructor(private readonly preMedicalTestService:PreMedicalTestService){}

    @Post()
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Create a new pre-medical-test' })
  @ApiResponse({ status: 201, description:'pre-medical-test created successfully',type: PreMedicalTestResponceDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  createPreMedicalTest(@Body() createDto: CreatePreMedicalTestDto) {
    return this.preMedicalTestService.createPreMedicalTest(createDto);
  }

  @Get()
  @UseGuards(StaffGuard)
  @ApiOperation({ summary: 'Get all pre-medical-tests' })
  @ApiResponse({ status: 200, description:"pre-medical-tests fetched successfully",type:PreMedicalTestResponceDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  findAllPreMedicalTests() {
    return this.preMedicalTestService.findAllPreMedicalTests();
  }

  @Get(':id')
  @UseGuards(StaffGuard)
  @ApiOperation({ summary: 'Get pre-medical-test by ID' })
  @ApiResponse({ status: 200,description:"pre-medical-test fetched successfully", type: PreMedicalTestResponceDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  findOne(@Param('id') id: string) {
    return this.preMedicalTestService.findOnePreMedicalTest(id);
  }

  @Patch(':id/status')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Update pre-medical-test status (done/pending)' })
  @ApiResponse({ status: 200,description:"pre-medical-test status updated successfully", type: PreMedicalTestResponceDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: boolean
  ) {
    return this.preMedicalTestService.changePreMedicalTestStatus(id, status);
  }

  @Patch(':id')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Update pre-medical-test details' })
  @ApiResponse({ status: 200,description:"pre-medical-test details updated successfully", type: PreMedicalTestResponceDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdatePreMedicalTestDto
  ) {
    return this.preMedicalTestService.updatePreMedicalTest(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Delete an pre-medical-test' })
  @ApiResponse({ status: 200,description:"pre-medical-test deleted successfully", type: PreMedicalTestResponceDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  deletePreMedicalTest(@Param('id') id: string) {
    return this.preMedicalTestService.removePreMedicalTest(id);
  }
}