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
import { InventoryService } from "./inventory.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { InventoryFilterDto } from "./dto/inventory-filter.dto";
import { InventoryResponseDto } from "./dto/inventory-response.dto";
import { InventoryListResponseDto } from "./dto/inventory-list-response.dto";
import { ApiErrorResponseDto } from "src/common/dto/api-error-response.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventories')
@UseGuards(JwtAuthGuard, AdminLevelGuard)

export class InventoryController{
    constructor(private readonly inventoryService:InventoryService){}

    @Post()
    @ApiOperation({ summary: 'Create inventory(SystemAdmin only)' })
    @ApiResponse({
        status: 201,
        description: 'Inventory created Successfully',
        type: InventoryResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiConflictResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    createInventory(@Req() req: { user: JwtPayload }, @Body() createInventoryDto:CreateInventoryDto){
        return this.inventoryService.createInventory(createInventoryDto, req.user)
    }

    @Get()
    @ApiOperation({summary:'List inventory with filters(systemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Inventory fetched Successfully',
        type:InventoryListResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiQuery({name:'search',required:false})
    @ApiQuery({name:'name',required:false})
    @ApiQuery({name:'quantity',required:false})
    @ApiQuery({name:'unit',required:false})
    @ApiQuery({name:'manufacturer',required:false})
    @ApiQuery({name:'price',required:false})
    @ApiQuery({name:'date',required:false})
    @ApiQuery({name:'assignedtoDisease',required:false})
    @ApiQuery({name:'page',required:false,type:Number,example:1})
    @ApiQuery({name:'limit',required:false,type:Number,example:10})
    @ApiQuery({name:'sortBy',required:false,example:'createdAt'})
    @ApiQuery({name:'sortOrder',required:false,example:'desc'})
    
    findAllPatients(@Req() req: { user: JwtPayload }, @Query() filter:InventoryFilterDto){
        return this.inventoryService.findAllInventory(filter, req.user)
    }

    @Get(':id')
    @ApiOperation({summary:'get inventory by id(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Inventory fetched Successfully',
        type:InventoryResponseDto
    })
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})

    findOneInventory(@Param('id') id:string){
        return this.inventoryService.findOneInventory(id)
    }

    @Patch(':id')
    @ApiOperation({summary:'Update inventory details(SystemAdmin only)'})
    @ApiResponse({
        status:200,
        description:'Inventory updated Successfully',
        type:InventoryResponseDto
    })
    @ApiBadRequestResponse({type:ApiErrorResponseDto})
    @ApiNotFoundResponse({type:ApiErrorResponseDto})
    @ApiForbiddenResponse({type:ApiErrorResponseDto})
    @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})

    updateInventory(@Param('id') id:string,@Body() updateInventoryDto:UpdateInventoryDto){
        return this.inventoryService.updateInventoryDetail(id,updateInventoryDto)
    }

   @Delete(':id')
   @ApiOperation({summary:'Delete inventory(SystemAdmin only)'})
   @ApiResponse({
    status:200,
    description:'Inventory deleted Successfully',
    
   })
   @ApiForbiddenResponse({type:ApiErrorResponseDto})
   @ApiInternalServerErrorResponse({type:ApiErrorResponseDto})
   @ApiNotFoundResponse({type:ApiErrorResponseDto})

   deleteInventory(@Param('id') id:string){
    return this.inventoryService.removeInventory(id)
   }


}