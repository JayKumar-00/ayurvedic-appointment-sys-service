import { 
  Controller, 
  Get, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBadRequestResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PatientQueueService } from './patient-queue.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReceptionLevelGuard } from 'src/auth/guards/reception-level.guard';
import { ApiErrorResponseDto } from 'src/common/dto/api-error-response.dto';

@ApiTags('Patient Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ReceptionLevelGuard)
@Controller('patient-queue')
export class PatientQueueController {
  constructor(private readonly patientQueueService: PatientQueueService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patient queue records' })
  @ApiResponse({ status: 200, description: "Patient queue entries fetched successfully" })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findAll() {
    return this.patientQueueService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update patient queue status (waiting/ready-for-doctor/sent-to-doctor/with-doctor/completed)' })
  @ApiResponse({ status: 200, description: "Patient queue status updated successfully" })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string
  ) {
    return this.patientQueueService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove patient from queue' })
  @ApiResponse({ status: 200, description: "Patient removed from queue successfully" })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.patientQueueService.remove(id);
  }
}
