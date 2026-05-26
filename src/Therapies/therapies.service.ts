import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Therapies, TherapiesDocument } from "./Schemas/therapies.schema";
import { AdminUser, AdminUserDocument } from "src/user/admin-user/schemas/admin-user.schema";
import { CreateTherapiesDto } from "./dto/create-therapies.dto";
import { UpdateTherapiesDto } from "./dto/update-therapies.dto";
import { TherapiesResponseDto } from "./dto/therapies-response.dto";
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class TherapiesService{
    private readonly logger=new Logger(TherapiesService.name)
    constructor(
        @InjectModel(Therapies.name)
        private readonly TherapiesModel:Model<TherapiesDocument>,
        @InjectModel(AdminUser.name)
        private readonly adminUserModel:Model<AdminUserDocument>
    ){}
    async createTherapies(createTherapiesDto:CreateTherapiesDto, user?: JwtPayload){
        try {
            this.logger.log(`Creating Therapies for ${JSON.stringify(createTherapiesDto)}`)

            let hospitalId = createTherapiesDto.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not associated with any hospital. Please contact a system administrator.');
                }
                hospitalId = user.hospitalId;
            }

            // Scope uniqueness check to the same hospital
            const nameQuery: Record<string, any> = { therapyName: createTherapiesDto.therapy };
            if (hospitalId) {
                nameQuery.hospitalId = hospitalId;
            }
            const existingTherapiesByName = await this.TherapiesModel.findOne(nameQuery);
            if (existingTherapiesByName) {
                throw new ConflictException("Therapy with this name already exists")
            }
            const therapies = await this.TherapiesModel.create({
                therapyName: createTherapiesDto.therapy,
                duration:createTherapiesDto.duration,
                type:createTherapiesDto.type,
                frequency:createTherapiesDto.frequency,
                price:createTherapiesDto.price,
                difficulty:createTherapiesDto.difficulty,
                description:createTherapiesDto.description,
                hospitalId,
            })
            return{
                id:therapies._id,
                therapyName:therapies.therapyName,
                duration:therapies.duration,
                type:therapies.type,
                frequency:therapies.frequency,
                price:therapies.price,
                difficulty:therapies.difficulty,
                description:therapies.description,
                hospitalId:therapies.hospitalId,
            }
        } catch (error) {
            throw this.handleServiceError(error, 'Error creating therapies')
        }
    }
    async findAllTherapies(user?: JwtPayload) {
        try {
            const query: Record<string, any> = {};
            if (user && !user.isSystemAdmin) {
                query.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const therapies = await this.TherapiesModel.find(query).exec();
            return therapies.map(therapies => this.toTherapiesResponse(therapies));
        } catch (error) {
            throw this.handleServiceError(error, 'Error fetching therapies');
        }
    }
    async findOneTherapies(id:string){
        const therapies=await this.TherapiesModel.findById(id)
        if(!therapies){
            throw new NotFoundException(`Therapies with id ${id} not found`)
            
        }
        return this.toTherapiesResponse(therapies)
    }
    async updateTherapies(id:string,updateTherapiesDto:UpdateTherapiesDto){
        try{
            const therapies=await this.TherapiesModel.findById(id).exec()
            if(!therapies){
                throw new NotFoundException(`Therapies with id ${id} not found`)
            }
            if (updateTherapiesDto) {
                therapies.therapyName = updateTherapiesDto.therapy ?? therapies.therapyName
                therapies.duration=updateTherapiesDto.duration??therapies.duration
                therapies.type=updateTherapiesDto.type??therapies.type
                therapies.frequency=updateTherapiesDto.frequency??therapies.frequency
                therapies.price=updateTherapiesDto.price??therapies.price
                therapies.difficulty=updateTherapiesDto.difficulty??therapies.difficulty
                therapies.description=updateTherapiesDto.description??therapies.description
            }
            await therapies.save()
            return this.toTherapiesResponse(therapies)
        }catch(error){
            throw this.handleServiceError(error,'Error in updating therapies')
        }
    }
    async removeTherapies(id:string){
        try{
            const therapies=await this.TherapiesModel.findById(id).exec()
            if(!therapies){
                throw new NotFoundException('Therapies not found')
            }
            await this.TherapiesModel.findByIdAndDelete(id).exec()
            return{
                message:'Therapies deleted successfully'
            }
        }catch(error){
            throw this.handleServiceError(error,'Error in deleting therapies')
        }
    }

    private toTherapiesResponse(therapies:TherapiesDocument):TherapiesResponseDto{
        return{
            _id:therapies._id.toString(),
            therapy:therapies.therapyName,
            duration:therapies.duration,
            type:therapies.type,
            frequency:therapies.frequency,
            price:therapies.price,
            difficulty:therapies.difficulty,
            description:therapies.description,
            hospitalId:therapies.hospitalId,
        }

    }
    private safeSortField(
        requestedField:string | undefined,
        allowedFields:string[],
        fallbackField:string
    ):string{
        if(!requestedField){
            return fallbackField
        }
        return allowedFields.includes(requestedField)?requestedField:fallbackField
    }
    private handleServiceError(error:unknown,fallbackMessage:string):Error{
        if(
            error instanceof BadRequestException ||
            error instanceof ConflictException ||
            error instanceof NotFoundException   
        ){
            return error
        }

        if (this.isDuplicateKeyError(error)){
            const duplicateMessage=this.getDuplicateKeyMessage(error)
            return new ConflictException(duplicateMessage)
        }

        const stack = error instanceof Error ? error.stack:undefined
        if (stack){
            this.logger.error(fallbackMessage,stack)

        }else{
            this.logger.error(fallbackMessage)
        }
        return new InternalServerErrorException(fallbackMessage)
    }
    private isDuplicateKeyError(error:unknown):error is {
        code:number
        keyValue?: Record<string,unknown>;
    }{
        return(
            typeof error === 'object'&&
            error !==null &&
            'code' in error &&
            (error as {code?:number}).code === 11000
        )
    }

    private getDuplicateKeyMessage(error:unknown):string{
        if(!this.isDuplicateKeyError(error) || !error.keyValue){
            return 'Duplicate record exists'
        }
        const keys=Object.keys(error.keyValue)
        if(keys.includes('therapyName')){
            return 'Therapies with this name already exists'
        }
        return 'Duplicate record exists'
    }
}
