import { Injectable, Logger, NotFoundException,ConflictException,BadRequestException,InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Inventory, InventoryDocument } from "./Schema/inventory";
import { Model } from "mongoose";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";
import { InventoryFilterDto } from "./dto/inventory-filter.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";


@Injectable()
export class InventoryService{
    private readonly logger = new Logger(InventoryService.name);
    constructor(
        @InjectModel(Inventory.name)
        private readonly inventoryModel:Model<InventoryDocument>
    ){}

    async createInventory(createInventoryDto:CreateInventoryDto,user?:JwtPayload){
        try {
            this.logger.log(`cretaing inventory with data:${JSON.stringify(createInventoryDto)}`);
            
            let hospitalId = createInventoryDto.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not associated with any hospital. Please contact a system administrator.');
                }
                hospitalId = user.hospitalId;
            }

            const nameQuery: Record<string, any> = { name: createInventoryDto.name };
            if (hospitalId) {
                nameQuery.hospitalId = hospitalId;
            }

            const existingInventory=await this.inventoryModel.findOne(nameQuery);
            if(existingInventory){
                throw new BadRequestException("Inventory with this name already exists")
            }

            const inventory=await this.inventoryModel.create({
                name:createInventoryDto.name,
                quantity:createInventoryDto.quantity,
                unit:createInventoryDto.unit,
                manufacturer:createInventoryDto.manufacturer,
                price:createInventoryDto.price,
                date:createInventoryDto.date,
                assignedtoDisease:createInventoryDto.assignedtoDisease,
                hospitalId
            })

            return this.toInventoryResponse(inventory)
        } catch (error) {
            throw this.handleServiceError(error,'Error creating inventory ')
        }
    }
    async findAllInventory(filter:InventoryFilterDto,user?:JwtPayload){
        const page=filter.page ?? 1;
        const limit=filter.limit ?? 10;
        const skip=(page-1)*limit

        const query:Record<string,any>={}

        if (user && !user.isSystemAdmin) {
            query.hospitalId = user.hospitalId || 'invalid_hospital_id';
        } else if (filter.hospitalId) {
            query.hospitalId = filter.hospitalId;
        }

        if(filter.search){
            query.$or=[
                {name:{$regex:filter.search,$options:'i'}},
                {manufacturer:{$regex:filter.search,$options:'i'}},
                {assignedtoDisease:{$regex:filter.search,$options:'i'}}
            ]
        }
        if(filter.name) query.name={$regex:filter.name,$options:'i'}
        if(filter.manufacturer) query.manufacturer={$regex:filter.manufacturer,$options:'i'}
        if(filter.assignedtoDisease) query.assignedtoDisease={$regex:filter.assignedtoDisease,$options:'i'}

        const sortBy=this.safeSortField(
            filter.sortBy,
            ['name','manufacturer','assignedtoDisease','createdAt'],
            'createdAt'
        )
        const sortOrder=filter.sortOrder === 'desc'?1:-1

        const [inventory,totalItems]=await Promise.all([
            this.inventoryModel.find(query).sort({[sortBy]:sortOrder}).skip(skip).limit(limit).exec(),
            this.inventoryModel.countDocuments(query).exec()
        ])
        return{
            data:inventory.map((inventory)=> this.toInventoryResponse(inventory)),
            meta:{
                totalItems,
                totalPages:Math.ceil(totalItems/limit),
                page,limit
            }
        }

    }
    async findOneInventory(id:string,user?:JwtPayload){
        const query:Record<string,any>={_id:id}
        if (user && !user.isSystemAdmin) {
            query.hospitalId = user.hospitalId || 'invalid_hospital_id';
        }
        const inventory=await this.inventoryModel.findOne(query).exec()
        if(!inventory){
            throw new NotFoundException(`Inventory with this id:${id} not found`)
        }
        return this.toInventoryResponse(inventory)
    }
    async updateInventoryDetail(id:string,updateInventoryDto:UpdateInventoryDto,user?:JwtPayload){
        try{
            const query:Record<string,any>={_id:id}
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const inventory=await this.inventoryModel.findOne(query).exec()
            if(!inventory){
                throw new NotFoundException(`Inventory with this id:${id} not found`)
            }
            
            if(updateInventoryDto){
                inventory.name=updateInventoryDto.name??inventory.name;
                inventory.quantity=updateInventoryDto.quantity??inventory.quantity;
                inventory.unit=updateInventoryDto.unit??inventory.unit;
                inventory.manufacturer=updateInventoryDto.manufacturer??inventory.manufacturer;
                inventory.price=updateInventoryDto.price??inventory.price;
                inventory.date=updateInventoryDto.date??inventory.date;
                inventory.assignedtoDisease=updateInventoryDto.assignedtoDisease??inventory.assignedtoDisease;
            }
            await inventory.save()

            return this.toInventoryResponse(inventory)

        }catch(error){
            throw this.handleServiceError(error,'Error updating inventory')
        }
    }
    async removeInventory(id:string,user?:JwtPayload){
        try{
            const query:Record<string,any>={_id:id}
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const inventory= await this.inventoryModel.findOne(query).exec()
            if(!inventory){
                throw new NotFoundException(`Inventory with this id:${id} not found`)
            }
            await this.inventoryModel.deleteOne(query).exec()

            return {
                success:true,
                message:`Inventory with id:${id} deleted successfully`
            }
        }catch(error){
            throw this.handleServiceError(error,'Error deleting inventory')
        }
    }

    private toInventoryResponse(inventory:InventoryDocument){
        return{
            _id:inventory._id.toString(),
            name:inventory.name,
            quantity:inventory.quantity,
            unit:inventory.unit,
            manufacturer:inventory.manufacturer,
            price:inventory.price,
            date:inventory.date,
            assignedtoDisease:inventory.assignedtoDisease,
            hospitalId:inventory.hospitalId
        }
    }
    private safeSortField(
    requestedField: string | undefined,
    allowedFields: string[],
    fallbackField: string,
  ): string {
    if (!requestedField) {
      return fallbackField;
    }

    return allowedFields.includes(requestedField)
      ? requestedField
      : fallbackField;
  }

  private handleServiceError(error: unknown, fallbackMessage: string): Error {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      return error as Error
    }

    if (this.isDuplicateKeyError(error)) {
      const duplicateMessage = this.getDuplicateKeyMessage(error)
      return new ConflictException(duplicateMessage)
    }

    const stack = error instanceof Error ? error.stack : undefined
    if (stack) {
      this.logger.error(fallbackMessage, stack)

    } else {
      this.logger.error(fallbackMessage)
    }
    return new InternalServerErrorException(fallbackMessage)
  }
  private isDuplicateKeyError(error: unknown): error is {
    code: number
    keyValue?: Record<string, unknown>;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    )
  }

  private getDuplicateKeyMessage(error: unknown): string {
    if (!this.isDuplicateKeyError(error) || !error.keyValue) {
      return 'Duplicate record exists'
    }
    const keys = Object.keys(error.keyValue)
    if (keys.includes('name')) {
      return 'Inventory with this name already exists'
    }


    return 'Duplicate record exists'
  }
    
}