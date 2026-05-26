import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Doctor, DoctorDocument } from "./Schemas/doctor.schema";

import { AdminUser } from "src/user/admin-user/schemas/admin-user.schema";
import { AdminUserDocument } from "src/user/admin-user/schemas/admin-user.schema";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update.doctor.dto";
import { DoctorResponseDto } from "./dto/doctor-response.dto";
import * as bcrypt from 'bcrypt';
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class DoctorService{
    private readonly logger=new Logger(DoctorService.name)
    constructor(
        @InjectModel(Doctor.name)
        private readonly doctorModel:Model<DoctorDocument>,
        @InjectModel(AdminUser.name)
        private readonly adminUserModel:Model<AdminUserDocument>
    ){}

    async createDoctor(createDoctorDto:CreateDoctorDto, user?: JwtPayload){
        try {
            this.logger.log(`Creating Doctor for ${JSON.stringify(createDoctorDto)}`)
            const existingDoctorByName=await this.doctorModel.findOne({
                name:createDoctorDto.name
            })
            if(existingDoctorByName){
                throw new ConflictException("Doctor already exists")
            }
            const hashedPassword=await bcrypt.hash(createDoctorDto.password,10)
            
            let hospitalId = createDoctorDto.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
                }
                hospitalId = user.hospitalId;
            }

            const doctor=await this.doctorModel.create({
                name:createDoctorDto.name,
                specialization:createDoctorDto.specialization,
                summary:createDoctorDto.summary,
                email:createDoctorDto.email.toLowerCase(),
                phone:createDoctorDto.phone,
                experience:createDoctorDto.experience,
                availableDays:createDoctorDto.availableDays,
                availableTime:createDoctorDto.availableTime,
                password:hashedPassword,
                isDoctor:true,
                hospitalId
            })
            return{
                id:doctor._id,
                _id:doctor._id.toString(),
                name:doctor.name,
                specialization:doctor.specialization,
                summary:doctor.summary,
                email:doctor.email,
                phone:doctor.phone,
                experience:doctor.experience,
                availableDays:doctor.availableDays,
                availableTime:doctor.availableTime,
                password:doctor.password,
                hospitalId:doctor.hospitalId
            }
        } catch (error) {
            throw this.handleServiceError(error, 'Error creating doctor')
        }
    }
    async findAllDoctors(user?: JwtPayload) {
        try {
            const filter: any = {};
            if (user && !user.isSystemAdmin) {
                filter.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const doctors = await this.doctorModel.find(filter).exec();
            return doctors.map(doctor => this.toDoctorResponse(doctor));
        } catch (error) {
            throw this.handleServiceError(error, 'Error fetching doctors');
        }
    }
    async findOneDoctor(id:string){
        const doctor=await this.doctorModel.findById(id)
        if(!doctor){
            throw new NotFoundException(`Doctor with id ${id} not found`)
            
        }
        return this.toDoctorResponse(doctor)
    }
    async updateDoctor(id:string,updateDoctordto:UpdateDoctorDto){
        try{
            const doctor=await this.doctorModel.findById(id).exec()
            if(!doctor){
                throw new NotFoundException(`Doctor with id ${id} not found`)
            }
            if(updateDoctordto){
                doctor.name=updateDoctordto.name??doctor.name
                doctor.specialization=updateDoctordto.specialization??doctor.specialization
                doctor.summary=updateDoctordto.summary??doctor.summary
                doctor.email=updateDoctordto.email ? updateDoctordto.email.toLowerCase() : doctor.email
                doctor.phone=updateDoctordto.phone??doctor.phone
                doctor.experience=updateDoctordto.experience??doctor.experience
                doctor.availableDays=updateDoctordto.availableDays??doctor.availableDays
                doctor.availableTime=updateDoctordto.availableTime??doctor.availableTime
                if(updateDoctordto.password){
                    doctor.password=await bcrypt.hash(updateDoctordto.password,10)
                }

            }
            await doctor.save()
            return this.toDoctorResponse(doctor)
        }catch(error){
            throw this.handleServiceError(error,'Error in updating doctor')
        }
    }
    async removeDoctor(id:string){
        try{
            const doctor=await this.doctorModel.findById(id).exec()
            if(!doctor){
                throw new NotFoundException('Doctor not found')
            }
            await this.doctorModel.findByIdAndDelete(id).exec()
            return{
                message:'Doctor deleted successfully'
            }
        }catch(error){
            throw this.handleServiceError(error,'Error in deleting doctor')
        }
    }

    private toDoctorResponse(doctor:DoctorDocument):DoctorResponseDto{
        return{
            _id:doctor._id.toString(),
            name:doctor.name,
            specialization:doctor.specialization,
            summary:doctor.summary,
            email:doctor.email,
            phone:doctor.phone,
            experience:doctor.experience,
            availableDays:doctor.availableDays,
            availableTime:doctor.availableTime,
            password:doctor.password,
            hospitalId:doctor.hospitalId
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
        if(keys.includes('email')){
            return 'Doctor with this email already exists'
        }
        if(keys.includes('name')){
            return 'Doctor with this name already exists'
        }
        if(keys.includes('phone')){
            return 'Doctor with this phone number already exists'
        }
        return 'Duplicate record exists'
    }
}