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
import { PatientsService } from "./patients.service";
import { CreatePatientsDto } from "./dto/create-patients.dto";
import { UpdatePatientsDto } from "./dto/update.patients.dto";
import { PatientsFilterDto } from "./dto/patients-filter.dto";
import { PatientsResponseDto } from "./dto/patients-response.dto";
import { PatientsListResponseDto } from "./dto/patients-list-response.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";



@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, AdminLevelGuard)

export class PatientsController{
    constructor(private readonly patientsService:PatientsService){}

    @Post()
    @ApiOperation({ summary: 'Create patient(SystemAdmin only)' })
    @ApiResponse({
        status: 201,
        description: 'Patient created Successfully',
        type: PatientsResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    createPatients(@Req() req: { user: JwtPayload }, @Body() createPatientsDto:CreatePatientsDto){
        return this.patientsService.createPatients(createPatientsDto, req.user)
    }

    @Get()
    @ApiOperation({summary:'List patients with filters(systemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Patients fetched Successfully',
        type:PatientsListResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiQuery({name:'search',required:false})
    @ApiQuery({name:'name',required:false})
    @ApiQuery({name:'email',required:false})
    @ApiQuery({name:'phone',required:false})
    @ApiQuery({name:'age',required:false})
    @ApiQuery({name:'gender',required:false})
    @ApiQuery({name:'bloodGroup',required:false})
    @ApiQuery({name:'appointmentDate',required:false,type:Date})
    @ApiQuery({name:'status',required:false})
    @ApiQuery({name:'page',required:false,type:Number,example:1})
    @ApiQuery({name:'limit',required:false,type:Number,example:10})
    @ApiQuery({name:'sortBy',required:false,example:'createdAt'})
    @ApiQuery({name:'sortOrder',required:false,example:'desc'})
    
    findAllPatients(@Req() req: { user: JwtPayload }, @Query() filter:PatientsFilterDto){
        return this.patientsService.findAllPatients(filter, req.user)
    }

    @Get(':id')
    @ApiOperation({summary:'get patient by id(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Patient fetched Successfully',
        type:PatientsResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})

    findOnePatients(@Param('id') id:string){
        return this.patientsService.findOnePatient(id)
    }

    @Patch(':id')
    @ApiOperation({summary:'Update patient details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Patient updated Successfully',
        type:PatientsResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    updatePatients(@Param('id') id:string,@Body() updatePatientsDto:UpdatePatientsDto){
        return this.patientsService.updatePatientDetail(id,updatePatientsDto)
    }

    @Patch(':id/status')
    @ApiOperation({summary:'Update patient status(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Patient status updated Successfully',
        type:PatientsResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

   updatePatientsStatus(
    @Param('id') id:string,
    @Body('isActive') isActive:boolean
   ){
    return this.patientsService.changePatientStatus(id,isActive)
   }


   @Delete(':id')
   @ApiOperation({summary:'Delete patient(SystemAdmin only)'})
   @ApiResponse({
    status:200,
    description:'Patient deleted Successfully',
    
   })
   @ApiForbiddenResponse({type:ApiErrorResponseDto})
   @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
   @ApiNotFoundResponse({type:ApiErrorResponseDto})

   deletePatients(@Param('id') id:string){
    return this.patientsService.removePatients(id)
   }


}