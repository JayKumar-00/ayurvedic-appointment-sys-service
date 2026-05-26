import { Controller, UseGuards, Post, Body, Get, Param, Patch, Delete, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";
import { StaffGuard } from "src/auth/guards/staff.guard";
import { DoctorService } from "./doctor.service";
import { DoctorResponseDto } from "./dto/doctor-response.dto";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { UpdateDoctorDto } from "./dto/update.doctor.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctor')
@UseGuards(JwtAuthGuard)
export class DoctorController {
    constructor(private readonly doctorService: DoctorService) { }

    @Post()
    @UseGuards(AdminLevelGuard)
    @ApiOperation({ summary: 'Create a new doctor' })
    @ApiResponse({
        status: 201,
        description: 'Doctor created successfully',
        type: DoctorResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    createDoctor(@Req() req: { user: JwtPayload }, @Body() createDoctorDto:CreateDoctorDto){
        return this.doctorService.createDoctor(createDoctorDto, req.user)
    }

    @Get()
    @UseGuards(StaffGuard)
    @ApiOperation({summary:'Get all doctors'})
    @ApiResponse({
        status:200,
        description:'Doctors fetch successfully',
        type:DoctorResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    findAllDoctors(@Req() req: { user: JwtPayload }){
        return this.doctorService.findAllDoctors(req.user)
    }

    @Get(':id')
    @UseGuards(StaffGuard)
    @ApiOperation({summary:'Get doctors by id'})
    @ApiResponse({
        status:200,
        description:'Doctors fetch successfully',
        type:DoctorResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    findOneDoctor(@Param('id')id:string){
        return this.doctorService.findOneDoctor(id)
    }

    @Patch(':id')
    @UseGuards(AdminLevelGuard)
    @ApiOperation({summary:'Update hospital details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Hospital updated Successfully',
        type:DoctorResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    updateDoctor(@Param('id') id:string,@Body() updateDoctorDto:UpdateDoctorDto){
        return this.doctorService.updateDoctor(id,updateDoctorDto)
    }

    @Delete(':id')
    @UseGuards(AdminLevelGuard)
    @ApiOperation({summary:'Delete doctor(HospitalAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Doctor deleted successfully',
        type:DoctorResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    deleteDoctor(@Param('id') id:string){
        return this.doctorService.removeDoctor(id)
    }
}