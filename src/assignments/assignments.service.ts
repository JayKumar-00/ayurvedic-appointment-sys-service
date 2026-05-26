import { BadRequestException,ConflictException,Injectable,InternalServerErrorException,Logger,NotFoundException } from "@nestjs/common";

import {InjectModel} from "@nestjs/mongoose"
import {Model} from "mongoose"
import { Assignment, AssignmentDocument } from "./schemas/assignments.schema";
import { AdminUser, AdminUserDocument } from "src/user/admin-user/schemas/admin-user.schema";
import { Hospital, HospitalDocument } from "src/user/admin-user/schemas/hospital.schema";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { AssignmentFilterDto } from "./dto/assignment-filter.dto";
import { UpdateAssignmentDto } from "./dto/update.assignment.dto";
import { AssignmentResponseDto } from "./dto/assignment-response.dto";






@Injectable()
export class AssignmentsService{
    private readonly logger = new Logger(AssignmentsService.name);

    constructor(
        @InjectModel(Assignment.name)
        private readonly assignmentModel: Model<AssignmentDocument>,
        @InjectModel(AdminUser.name)
        private readonly adminUserModel: Model<AdminUserDocument>,
        @InjectModel(Hospital.name)
        private readonly hospitalModel: Model<HospitalDocument>
    ) {}


    private async syncAdminUserHospital(adminName: string): Promise<void> {
        try {
            const escapedAdminName = adminName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const adminRegex = new RegExp(`^${escapedAdminName}$`, 'i');

            const activeAssignment = await this.assignmentModel.findOne({
                Administrator: { $regex: adminRegex },
                isActive: true,
            }).exec();

            if (activeAssignment) {
                const escapedHospitalName = activeAssignment.Hospital.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const hospital = await this.hospitalModel.findOne({
                    name: { $regex: new RegExp(`^${escapedHospitalName}$`, 'i') },
                }).exec();

                if (hospital) {
                    const updatedUser = await this.adminUserModel.findOneAndUpdate(
                        { name: { $regex: adminRegex } },
                        { hospitalId: hospital._id.toString() },
                        { new: true }
                    ).exec();
                    if (updatedUser) {
                        this.logger.log(`Synced hospitalId ${hospital._id} to admin user ${updatedUser.name} (matched by "${adminName}")`);
                    } else {
                        this.logger.warn(`Could not find admin user with name matching "${adminName}" to sync hospitalId`);
                    }
                    return;
                } else {
                    this.logger.warn(`Could not find hospital with name matching "${activeAssignment.Hospital}" to sync hospitalId`);
                }
            }

            // If no active assignment or hospital not found, remove hospitalId
            const updatedUser = await this.adminUserModel.findOneAndUpdate(
                { name: { $regex: adminRegex } },
                { $unset: { hospitalId: "" } },
                { new: true }
            ).exec();
            if (updatedUser) {
                this.logger.log(`Removed hospitalId from admin user ${updatedUser.name} (matched by "${adminName}")`);
            } else {
                this.logger.warn(`Could not find admin user with name matching "${adminName}" to remove hospitalId`);
            }
        } catch (error) {
            this.logger.error(`Error syncing hospitalId for admin user ${adminName}: ${error}`);
        }
    }

    async createAssignment(createAssignmentDto: CreateAssignmentDto){
        try{
            this.logger.log(`Creating assignment for ${JSON.stringify(createAssignmentDto)}`)
            const existingAssignmentByName=await this.assignmentModel.findOne({
                Administrator:createAssignmentDto.Administrator,
            })
            if(existingAssignmentByName){
                throw new ConflictException('Assignment with this name already exists')
            }

            const assignment=await this.assignmentModel.create({
                Administrator:createAssignmentDto.Administrator,
                Hospital:createAssignmentDto.Hospital,
                Role:createAssignmentDto.Role,
                Permission:createAssignmentDto.Permission,
                StartDate:createAssignmentDto.StartDate,
                isActive:true

            })

            await this.syncAdminUserHospital(createAssignmentDto.Administrator);

            return{
                id:assignment._id,
                name:assignment.Administrator,
                hospital:assignment.Hospital,
                role:assignment.Role,
                permission:assignment.Permission,
                startDate:assignment.StartDate,
                isActive:assignment.isActive
            };

        }catch(error){
                throw this.handleServiceError(error,'Error creating Assignment')
            }
    }
    async findAllAssignments(filter:AssignmentFilterDto){
        const page = filter.page??1;
        const limit=filter.limit??10;
        const skip=(page-1)*limit

        const query:Record<string,unknown>={}

        if (filter.search){
            query.$or=[
                {Administrator:{$regex:filter.search,$options:'i'}},
                {Hospital:{$regex:filter.search,$options:'i'}},
                {Role:{$regex:filter.search,$options:'i'}},
                {Permission:{$regex:filter.search,$options:'i'}}
            ]
        }
        if (filter.Administrator) query.Administrator={$regex:filter.Administrator,$options:'i'}
        if (filter.Hospital) query.Hospital={$regex:filter.Hospital,$options:'i'}
        if(filter.Role) query.Role={$regex:filter.Role,$options:'i'}
        if (filter.Permission) query.Permission={$regex:filter.Permission,$options:'i'}
        

        this.logger.log(`Fetching assignments with query:${JSON.stringify(query)}`)

        const sortBy=this.safeSortField(
            filter.sortBy,
            ['createdAt','updatedAt','Administrator','Hospital','Role','Permission','StartDate','isActive'],
            'createdAt'
        )

        const sortOrder=filter.sortOrder === 'asc'? 1:-1;

        const [assignments, totalItems] = await Promise.all([
            this.assignmentModel.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).exec(),
            this.assignmentModel.countDocuments(query).exec()
        ]);

        return{
            data:assignments.map((assignment)=> this.toAssignmentResponse(assignment)),
            meta:{
                totalItems,
                totalPages:Math.ceil(totalItems/limit),
                page,
                limit
            }
        }
        
    }

    async findOneAssignment(id:string){
        const assignment=await this.assignmentModel.findById(id)
        if(!assignment){
            throw new NotFoundException(`Assignment with id ${id} not found`);
        }
        return this.toAssignmentResponse(assignment)
    }

    async changeAssignmentStatus(id:string,isActive:boolean){
        try{
            const assignment=await this.assignmentModel.findById(id).exec()
            if(!assignment){
                throw new NotFoundException(`Assignment with id ${id} not found`);

            }
            await this.assignmentModel.findByIdAndUpdate(id,{isActive},{new:true}).exec()

            await this.syncAdminUserHospital(assignment.Administrator);

            return{
                message:`Assignment ${isActive?'activated':'deactivated'} Sucessfully`,
            }
        }catch(error){
            throw this.handleServiceError(error,'Error updating Assignment Status')
        }
    }
    async updateAssignmentDetail(id:string,updateAssignmentDto:UpdateAssignmentDto){
        try{
            const assignment=await this.assignmentModel.findById(id).exec()
            if(!assignment){
                throw new NotFoundException(`Assignment with id ${id} not found`);
            }
            const oldAdministrator = assignment.Administrator;
            if(assignment.isActive === false){
                throw new BadRequestException(`Assignment is not active`);
            }
            if(updateAssignmentDto){
                assignment.Administrator=updateAssignmentDto.Administrator ?? assignment.Administrator;
                assignment.Hospital=updateAssignmentDto.Hospital ?? assignment.Hospital;
                assignment.Role=updateAssignmentDto.Role ?? assignment.Role;
                assignment.Permission=updateAssignmentDto.Permission ?? assignment.Permission;
                assignment.StartDate=updateAssignmentDto.StartDate ?? assignment.StartDate;
            }
            await assignment.save()

            await this.syncAdminUserHospital(oldAdministrator);
            if (oldAdministrator !== assignment.Administrator) {
                await this.syncAdminUserHospital(assignment.Administrator);
            }

            return this.toAssignmentResponse(assignment)
        }catch(error){
            throw this.handleServiceError(error,'Error updating Assignment Detail')
        }
    }
    async removeAssignment(id:string){
        try{
            const assignment = await this.assignmentModel.findById(id).exec()
            if(!assignment){
                throw new NotFoundException('Assignment not found')
            }
            const administrator = assignment.Administrator;
            await this.assignmentModel.findByIdAndDelete(id).exec()
            
            await this.syncAdminUserHospital(administrator);

            return{
                message:'Assignment deleted successfully'
            }
        } catch(err){
            throw this.handleServiceError(err,'Error deleting assignment')
        }
    }
    private toAssignmentResponse(assignment:AssignmentDocument):AssignmentResponseDto{
        return{
            _id:assignment._id.toString(),
            Administrator:assignment.Administrator,
            Hospital:assignment.Hospital,
            Role:assignment.Role,
            Permission:assignment.Permission,
            StartDate:assignment.StartDate,
            isActive:assignment.isActive
        }
    }
    private safeSortField(
        requestedField:string | undefined,
        allowedFields:string[],
        fallbackField:string,
    ):string{
        if(!requestedField){
            return fallbackField;
        }

        return allowedFields.includes(requestedField)
        ? requestedField
        :fallbackField;
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
            return 'User with this email already exists'
        }
        if(keys.includes('Administrator')){
            return 'User with this Administrator already exists'
        }
        if(keys.includes('Hospital')){
            return 'User with this Hospital already exists'
        }
        if(keys.includes('Role')){
            return 'User with this Role already exists'
        }
        if(keys.includes('Permission')){
            return 'User with this Permission already exists'
        }
        return 'Duplicate record exists'
    }
}