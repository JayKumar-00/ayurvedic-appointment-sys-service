import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Req } from "@nestjs/common";
import { 
    ApiTags, 
    ApiBearerAuth, 
    ApiQuery, 
    ApiOperation, 
    ApiResponse, 
    ApiBadRequestResponse, 
    ApiConflictResponse, 
    ApiForbiddenResponse, 
    ApiInternalServerErrorResponse, 
    ApiNotFoundResponse 
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";
import { AdminAppointmentService } from "./admin-appointment.service";
import { CreateAdminAppointmentDto } from "./dto/create-admin-appointment.dto";
import { UpdateAdminAppointmentDto } from "./dto/update-admin-appointment.dto";
import { AdminAppointmentFilterDto } from "./dto/admin-appointment-filter.dto";
import { AdminAppointmentResponseDto } from "./dto/admin-appointment-response.dto";
import { AdminAppointmentListResponseDto } from "./dto/admin-appointment-list-response.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@ApiTags('admin-appointment')
@ApiBearerAuth()
@Controller('admin-appointment')
@UseGuards(JwtAuthGuard, AdminLevelGuard)

export class AdminAppointmentController{
    constructor(private readonly adminAppointmentsService:AdminAppointmentService){}

    @Post()
    @ApiOperation({ summary: 'Create admin appointment(SystemAdmin only)' })
    @ApiResponse({
        status: 201,
        description: 'Admin Appointment created Successfully',
        type: AdminAppointmentResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    createAdminAppointment(@Req() req: { user: JwtPayload }, @Body() createAdminAppointmentDto:CreateAdminAppointmentDto){
        return this.adminAppointmentsService.createAdminAppointment(createAdminAppointmentDto, req.user)
    }

    @Get()
    @ApiOperation({summary:'List admin appointments with filters(systemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Admin Appointments fetched Successfully',
        type:AdminAppointmentListResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiQuery({name:'search',required:false})
    @ApiQuery({name:'patientName',required:false})
    @ApiQuery({name:'doctorName',required:false})
    @ApiQuery({name:'type',required:false})
    @ApiQuery({name:'date',required:false})
    @ApiQuery({name:'time',required:false})
    @ApiQuery({name:'status',required:false})
    @ApiQuery({name:'page',required:false,type:Number,example:1})
    @ApiQuery({name:'limit',required:false,type:Number,example:10})
    @ApiQuery({name:'sortBy',required:false,example:'createdAt'})
    @ApiQuery({name:'sortOrder',required:false,example:'desc'})
    
    findAllAdminAppointments(@Req() req: { user: JwtPayload }, @Query() filter:AdminAppointmentFilterDto){
        return this.adminAppointmentsService.findAllAdminAppointments(filter, req.user)
    }

    @Get(':id')
    @ApiOperation({summary:'get admin appointment by id(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Admin Appointment fetched Successfully',
        type:AdminAppointmentResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})

    findOneAdminAppointments(@Param('id') id:string){
        return this.adminAppointmentsService.findOneAdminAppointment(id)
    }

    @Patch(':id')
    @ApiOperation({summary:'Update admin appointment details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Admin Appointment updated Successfully',
        type:AdminAppointmentResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    updateAdminAppointments(@Param('id') id:string,@Body() updateAdminAppointmentsDto:UpdateAdminAppointmentDto){
        return this.adminAppointmentsService.updateAdminAppointmentDetail(id,updateAdminAppointmentsDto)
    }

    @Patch(':id/status')
    @ApiOperation({summary:'Update admin appointment status(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Admin Appointment status updated Successfully',
        type:AdminAppointmentResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

   updateAdminAppointmentsStatus(
    @Param('id') id:string,
    @Body('isActive') isActive:boolean
   ){
    return this.adminAppointmentsService.changeAdminAppointmentStatus(id,isActive)
   }


   @Delete(':id')
   @ApiOperation({summary:'Delete admin appointment(SystemAdmin only)'})
   @ApiResponse({
    status:200,
    description:'Admin Appointment deleted Successfully',
    
   })
   @ApiForbiddenResponse({type:ApiErrorResponseDto})
   @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
   @ApiNotFoundResponse({type:ApiErrorResponseDto})

   deleteAdminAppointments(@Param('id') id:string){
    return this.adminAppointmentsService.removeAdminAppointment(id)
   }


}

