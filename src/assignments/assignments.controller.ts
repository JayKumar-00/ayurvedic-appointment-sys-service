import { Body,Controller,Delete,Get,Param,Patch,Post,Query,UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse,ApiBearerAuth,ApiConflictResponse,ApiForbiddenResponse,ApiInternalServerErrorResponse,ApiNotFoundResponse,ApiOperation,ApiResponse,ApiQuery,ApiTags } from "@nestjs/swagger";

import { SystemAdminGuard } from "src/user/admin-user/guards/system-admin.guard";
import { AssignmentsService } from "./assignments.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update.assignment.dto";
import { AssignmentResponseDto } from "./dto/assignment-response.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AssignmentFilterDto } from "./dto/assignment-filter.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";




@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
@UseGuards(JwtAuthGuard, SystemAdminGuard)

export class AssignmentController{
    constructor(private readonly assignmentsService:AssignmentsService){}

    @Post()
    @ApiOperation({ summary: 'Create assignment(SystemAdmin only)' })
    @ApiResponse({
        status: 201,
        description: 'Assignment created Successfully',
        type: AssignmentResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    createAssignment(@Body() createAssignmentDto:CreateAssignmentDto){
        return this.assignmentsService.createAssignment(createAssignmentDto)
    }

    @Get()
    @ApiOperation({summary:'List assignments with filters(systemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Assignments fetched Successfully',
        type:AssignmentResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiQuery({name:'search',required:false})
    @ApiQuery({name:'Administrator',required:false})
    @ApiQuery({name:'Hospital',required:false})
    @ApiQuery({name:'Role',required:false})
    @ApiQuery({name:'Permission',required:false})
    @ApiQuery({name:'page',required:false,type:Number,example:1})
    @ApiQuery({name:'limit',required:false,type:Number,example:10})
    @ApiQuery({name:'sortBy',required:false,example:'createdAt'})
    @ApiQuery({name:'sortOrder',required:false,example:'desc'})
    
    findAllAssignments(@Query() filter:AssignmentFilterDto){
        return this.assignmentsService.findAllAssignments(filter)
    }

    @Get(':id')
    @ApiOperation({summary:'get Assignment by id(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Assignment fetched Successfully',
        type:AssignmentResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})

    findOneAssignment(@Param('id') id:string){
        return this.assignmentsService.findOneAssignment(id)
    }

    @Patch(':id')
    @ApiOperation({summary:'Update hospital details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Hospital updated Successfully',
        type:AssignmentResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    updateAssignment(@Param('id') id:string,@Body() updateAssignmentDto:UpdateAssignmentDto){
        return this.assignmentsService.updateAssignmentDetail(id,updateAssignmentDto)
    }

    @Patch(':id/status')
    @ApiOperation({summary:'Update assignment status(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Assignment status updated Successfully',
        type:AssignmentResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

   updateAssignmentStatus(
    @Param('id') id:string,
    @Body('isActive') isActive:boolean
   ){
    return this.assignmentsService.changeAssignmentStatus(id,isActive)
   }


   @Delete(':id')
   @ApiOperation({summary:'Delete assignment(SystemAdmin only)'})
   @ApiResponse({
    status:200,
    description:'Assignment deleted Successfully',
    
   })
   @ApiForbiddenResponse({type:ApiErrorResponseDto})
   @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
   @ApiNotFoundResponse({type:ApiErrorResponseDto})

   deleteAssignment(@Param('id') id:string){
    return this.assignmentsService.removeAssignment(id)
   }


}