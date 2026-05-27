import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query,
  Req
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
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

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
  createReceptionistAppointment(@Req() req: { user: JwtPayload }, @Body() createDto: CreateReceptionistAppointmentDto) {
    return this.appointmentService.createAppointment(createDto, req.user);
  }

  @Get()
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description:"Appointments fetched successfully",type:ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  findAllAppointments(@Req() req: { user: JwtPayload }) {
    return this.appointmentService.findAllAppointments(req.user);
  }

  @Get(':id')
  @UseGuards(StaffGuard)
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200,description:"Appointments fetched successfully", type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  findOne(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.appointmentService.findOnePatient(id, req.user);
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
    @Req() req: { user: JwtPayload },
    @Param('id') id: string, 
    @Body('isActive') isActive: boolean
  ) {
    return this.appointmentService.changeAppointmentStatus(id, isActive, req.user);
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
    @Req() req: { user: JwtPayload },
    @Param('id') id: string, 
    @Body() updateDto: UpdateReceptionDto
  ) {
    return this.appointmentService.updatePatientDetail(id, updateDto, req.user);
  }

  @Delete(':id')
  @UseGuards(ReceptionLevelGuard)
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200,description:"Appointments deleted successfully", type: ReceptionResponseDto })
  @ApiBadRequestResponse({type:ApiErrorResponseDto})
  @ApiConflictResponse({type:ApiErrorResponseDto})
  @ApiForbiddenResponse({type:ApiErrorResponseDto})
  @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
  deleteAppointments(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.appointmentService.removeAppointments(id, req.user);
  }

  // naya end point doctor ke liye 
  @Get('doctor/appointments')
  @ApiOperation({ summary:'Get doctor appointment by doctor name'})
  findDoctorAppointments(@Req() req: { user: JwtPayload }, @Query('doctorName')doctorName:string){
    return this.appointmentService.findDoctorAppointments(doctorName, req.user);
  }
}
