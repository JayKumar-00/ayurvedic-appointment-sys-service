import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from "@nestjs/common"
import { CreateReceptionDto } from "./dto/create-reception.dto"
import { UpdateReceptionDto } from "./dto/update-reception.dto"
import { ReceptionResponseDto } from "./dto/reception-response.dto"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiConflictResponse } from "@nestjs/swagger"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard"
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto"
import { ReceptionService } from "./reception.service"
import { JwtPayload } from "src/auth/strategies/jwt.strategy";


@ApiTags('Receptionists')
@ApiBearerAuth()
@Controller('receptionist')
@UseGuards(JwtAuthGuard, AdminLevelGuard)
export class ReceptionController {
    constructor(private readonly receptionService: ReceptionService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new receptionist' })
    @ApiResponse({
        status: 201,
        description: 'Receptionist created successfully',
        type: ReceptionResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    createReception(@Req() req: { user: JwtPayload }, @Body() createReceptionDto:CreateReceptionDto){
        return this.receptionService.createReception(createReceptionDto, req.user)
    }

    @Get()
    @ApiOperation({summary:'Get all receptionists'})
    @ApiResponse({
        status:200,
        description:'Receptionists fetch successfully',
        type:ReceptionResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    findAllReception(@Req() req: { user: JwtPayload }){
        return this.receptionService.findAllReception(req.user)
    }

    @Get(':id')
    @ApiOperation({summary:'Get receptionists by id'})
    @ApiResponse({
        status:200,
        description:'Receptionists fetch successfully',
        type:ReceptionResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    findOneReception(@Param('id')id:string){
        return this.receptionService.findOneReception(id)
    }

    @Patch(':id')
    @ApiOperation({summary:'Update receptionist details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Receptionist updated Successfully',
        type:ReceptionResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    updateReception(@Param('id') id:string,@Body() updateReceptionDto:UpdateReceptionDto){
        return this.receptionService.updateReception(id,updateReceptionDto)
    }

    @Delete(':id')
    @ApiOperation({summary:'Delete receptionist(HospitalAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Receptionist deleted successfully',
        type:ReceptionResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    deleteReception(@Param('id') id:string){
        return this.receptionService.removeReception(id)
    }
}