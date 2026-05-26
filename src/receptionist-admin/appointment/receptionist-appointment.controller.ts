import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ReceptionistAppointmentService } from './receptionist-appointment.service';
import { CreateReceptionistAppointmentDto } from './dto/create-receptionist-appointment.dto';
import { ReceptionResponseDto } from './dto/receptionist-appointment-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReceptionLevelGuard } from 'src/auth/guards/reception-level.guard';
import { StaffGuard } from 'src/auth/guards/staff.guard';
import { ApiErrorResponseDto } from 'src/common/dto/api-error-response.dto';
import { UpdateReceptionDto } from './dto/update-receptionist-appointment.dto';

@ApiTags('Receptionist Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('receptionist-appointments')
export class ReceptionistAppointmentController {
  constructor(private readonly appointmentService: ReceptionistAppointmentService) {}

  @Post()
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description:'Appointment created successfully',type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  createReceptionistAppointment(@Body() createDto: CreateReceptionistAppointmentDto) {
    return this.appointmentService.createAppointment(createDto);
  }

  @Get()
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description:"Appointments fetched successfully",type:ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  findAllAppointments() {
    return this.appointmentService.findAllAppointments();
  }

  @Get(':id')
  @UseGuards(StaffGuard)
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200,description:"Appointments fetched successfully", type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOnePatient(id);
  }

  @Patch(':id/status')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Update appointment status (active/inactive)' })
  @ApiResponse({ status: 200,description:"Appointments status updated successfully", type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  updateStatus(
    @Param('id') id: string, 
    @Body('isActive') isActive: boolean
  ) {
    return this.appointmentService.changeAppointmentStatus(id, isActive);
  }

  @Patch(':id')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Update appointment details' })
  @ApiResponse({ status: 200,description:"Appointments details updated successfully", type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateReceptionDto
  ) {
    return this.appointmentService.updatePatientDetail(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200,description:"Appointments deleted successfully", type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  deleteAppointments(@Param('id') id: string) {
    return this.appointmentService.removeAppointments(id);
  }

  // naya end point doctor ke liye 
  @Get('doctor/appointments')
  @ApiOperation({ summary:'Get doctor appointment by doctor name'})
  findDoctorAppointments(@Query('doctorName')doctorName:string){
    return this.appointmentService.findDoctorAppointments(doctorName)
  }
}
