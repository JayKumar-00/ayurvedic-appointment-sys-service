import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateReceptionDto } from "./dto/create-reception.dto";
import { UpdateReceptionDto } from "./dto/update-reception.dto";
import { ReceptionResponseDto } from "./dto/reception-response.dto";
import { Reception, ReceptionDocument } from "./Schemas/reception.schema";
import { AdminUser, AdminUserDocument } from "src/user/admin-user/schemas/admin-user.schema";
import * as bcrypt from 'bcrypt';
import { JwtPayload } from "src/auth/strategies/jwt.strategy";

@Injectable()
export class ReceptionService {
    private readonly logger = new Logger(ReceptionService.name)
    constructor(
        @InjectModel(Reception.name)
        private readonly receptionModel: Model<ReceptionDocument>,
        @InjectModel(AdminUser.name)
        private readonly adminUserModel: Model<AdminUserDocument>
    ) { }
    async createReception(createReceptionDto: CreateReceptionDto, user?: JwtPayload) {
        try {
            this.logger.log(`Creating Receptionist for ${JSON.stringify(createReceptionDto)}`)
            const existingReceptionistByName = await this.receptionModel.findOne({
                name: createReceptionDto.name
            })
            if (existingReceptionistByName) {
                throw new ConflictException("Receptionist already exists")
            }
            const hashedPassword = await bcrypt.hash(createReceptionDto.password, 10);

            let hospitalId = createReceptionDto.hospitalId;
            if (user && !user.isSystemAdmin) {
                if (!user.hospitalId) {
                    throw new BadRequestException('Your account is not assigned to any clinic/hospital.');
                }
                hospitalId = user.hospitalId;
            }

            const reception = await this.receptionModel.create({
                name: createReceptionDto.name,
                age: createReceptionDto.age,
                gender: createReceptionDto.gender,
                education: createReceptionDto.education,
                email: createReceptionDto.email.toLowerCase(),
                phone: createReceptionDto.phone,
                password: hashedPassword,
                isReceptionist: true,
                hospitalId
            })
            return {
                id: reception._id,
                _id: reception._id.toString(),
                name: reception.name,
                age: reception.age,
                gender: reception.gender,
                education: reception.education,
                email: reception.email,
                phone: reception.phone,
                password: reception.password,
                hospitalId: reception.hospitalId
            }
        } catch (error) {
            throw this.handleServiceError(error, 'Error creating receptionist')
        }
    }
    async findAllReception(user?: JwtPayload) {
        try {
            const filter: any = {};
            if (user && !user.isSystemAdmin) {
                filter.hospitalId = user.hospitalId || 'invalid_hospital_id';
            }
            const reception = await this.receptionModel.find(filter).exec();
            return reception.map(reception => this.toReceptionResponse(reception));
        } catch (error) {
            throw this.handleServiceError(error, 'Error fetching receptionist');
        }
    }
    async findOneReception(id: string) {
        const reception = await this.receptionModel.findById(id)
        if (!reception) {
            throw new NotFoundException(`Receptionist with id ${id} not found`)

        }
        return this.toReceptionResponse(reception)
    }
    async updateReception(id: string, updateReceptionDto: UpdateReceptionDto) {
        try {
            const reception = await this.receptionModel.findById(id).exec()
            if (!reception) {
                throw new NotFoundException(`Receptionist with id ${id} not found`)
            }
            if (updateReceptionDto) {
                reception.name = updateReceptionDto.name ?? reception.name
                reception.age = updateReceptionDto.age ?? reception.age
                reception.gender = updateReceptionDto.gender ?? reception.gender
                reception.email = updateReceptionDto.email?.toLowerCase() ?? reception.email
                reception.phone = updateReceptionDto.phone ?? reception.phone
                reception.education = updateReceptionDto.education ?? reception.education
                if (updateReceptionDto.password) {
                    reception.password = await bcrypt.hash(updateReceptionDto.password, 10);
                }
            }
            await reception.save()
            return this.toReceptionResponse(reception)
        } catch (error) {
            throw this.handleServiceError(error, 'Error in updating receptionist')
        }
    }
    async removeReception(id: string) {
        try {
            const reception = await this.receptionModel.findById(id).exec()
            if (!reception) {
                throw new NotFoundException('Receptionist not found')
            }
            await this.receptionModel.findByIdAndDelete(id).exec()
            return {
                message: 'Receptionist deleted successfully'
            }
        } catch (error) {
            throw this.handleServiceError(error, 'Error in deleting receptionist')
        }
    }

    private toReceptionResponse(reception: ReceptionDocument): ReceptionResponseDto {
        return {
            _id: reception._id.toString(),
            name: reception.name,
            age: reception.age,
            gender: reception.gender,
            education: reception.education,
            email: reception.email,
            phone: reception.phone,
            password: reception.password,
            hospitalId: reception.hospitalId
        }

    }
    private safeSortField(
        requestedField: string | undefined,
        allowedFields: string[],
        fallbackField: string
    ): string {
        if (!requestedField) {
            return fallbackField
        }
        return allowedFields.includes(requestedField) ? requestedField : fallbackField
    }
    private handleServiceError(error: unknown, fallbackMessage: string): Error {
        if (
            error instanceof BadRequestException ||
            error instanceof ConflictException ||
            error instanceof NotFoundException
        ) {
            return error
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
        if (keys.includes('email')) {
            return 'receptionist with this email already exists'
        }
        if (keys.includes('phone')) {
            return 'receptionist with this phone number already exists'
        }
        return 'Duplicate record exists'
    }
}
