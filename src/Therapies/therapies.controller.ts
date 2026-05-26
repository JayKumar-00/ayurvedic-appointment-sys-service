import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";
import { TherapiesService } from "./therapies.service";
import { CreateTherapiesDto } from "./dto/create-therapies.dto";
import { UpdateTherapiesDto } from "./dto/update-therapies.dto";
import { TherapiesResponseDto } from "./dto/therapies-response.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@ApiTags('Therapies')
@ApiBearerAuth()
@Controller('therapies')
@UseGuards(JwtAuthGuard, AdminLevelGuard)
export class TherapiesController {
    constructor(private readonly therapiesService: TherapiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new therapy' })
    @ApiResponse({
        status: 201,
        description: 'Therapy created successfully',
        type: TherapiesResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    createTherapy(@Req() req: { user: JwtPayload }, @Body() createTherapyDto: CreateTherapiesDto){
        return this.therapiesService.createTherapies(createTherapyDto, req.user)
    }

    @Get()
    @ApiOperation({summary:'Get all therapies'})
    @ApiResponse({
        status:200,
        description:'Therapies fetch successfully',
        type:TherapiesResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    findAllTherapy(@Req() req: { user: JwtPayload }){
        return this.therapiesService.findAllTherapies(req.user)
    }

    @Get(':id')
    @ApiOperation({summary:'Get therapies by id'})
    @ApiResponse({
        status:200,
        description:'Therapies fetch successfully',
        type:TherapiesResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    findOneTherapy(@Param('id')id:string){
        return this.therapiesService.findOneTherapies(id)
    }

    @Patch(':id')
    @ApiOperation({summary:'Update therapy details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Therapy updated Successfully',
        type:TherapiesResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    updateTherapy(@Param('id') id:string,@Body() updateTherapyDto:UpdateTherapiesDto){
        return this.therapiesService.updateTherapies(id,updateTherapyDto)
    }

    @Delete(':id')
    @ApiOperation({summary:'Delete therapy(HospitalAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Therapy deleted successfully',
        type:TherapiesResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    deleteTherapy(@Param('id') id:string){
        return this.therapiesService.removeTherapies(id)
    }
}