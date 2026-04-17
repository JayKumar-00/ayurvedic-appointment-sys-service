import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SystemAdminGuard } from '../user/admin-user/guards/system-admin.guard';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';
import { AppointmentListResponseDto } from './dto/appointment-list.response.dto';
import { AppointmentResponseDto } from './dto/appointment.response.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PermissionGuard } from '../user/role-permission/guards/permission.guard';
import { RequirePermission } from '../user/role-permission/decorators/require-permission.decorator';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiBody({ type: CreateAppointmentDto })
  @ApiOperation({ summary: 'Create appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(createAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SystemAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointments with filters' })
  @ApiResponse({
    status: 200,
    description: 'Appointments fetched successfully',
    type: AppointmentListResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'appointmentDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  getAppointments(
    @Req() req: { user: JwtPayload },
    @Query() filter: AppointmentFilterDto,
  ) {
    return this.appointmentService.getAppointments(filter, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth()
  @RequirePermission('appointments', 'update')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiParam({ name: 'id', description: 'Appointment id' })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateAppointment(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(
      id,
      updateAppointmentDto,
      req.user,
    );
  }
}
