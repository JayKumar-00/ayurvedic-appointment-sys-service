import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Staff } from './entity/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStaffDto } from './dto/create-user.dto';
import { Types } from 'mongoose';
import { UpdateStaffDto } from './dto/update-user.dto';
import { StaffFilterDto } from './dto/staff-filter.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<Staff>,
  ) {}

  async createStaff(
    createStaffDto: CreateStaffDto,
    createdBy: string,
  ): Promise<Staff> {
    try {
      if (!Types.ObjectId.isValid(createdBy)) {
        throw new BadRequestException('Invalid creator id provided');
      }

      const staff = await this.staffModel.findOne({
        email: createStaffDto.email,
      });

      if (staff) {
        throw new ConflictException('Staff with this email already exists');
      }
      const passwordHashed = await bcrypt.hash(createStaffDto.password, 10);

      const newStaff = await this.staffModel.create({
        ...createStaffDto,
        password: passwordHashed,
        createdBy: new Types.ObjectId(createdBy),
        isActive: true,
      });

      return newStaff;
    } catch (err) {
      throw this.handleServiceError(err, 'Failed to create staff');
    }
  }

  async getAllStaff(filter: StaffFilterDto): Promise<{
    data: Staff[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    try {
      const page = filter.page ?? 1;
      const limit = filter.limit ?? 10;
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = {};

      if (filter.search) {
        query.$or = [
          { name: { $regex: filter.search, $options: 'i' } },
          { email: { $regex: filter.search, $options: 'i' } },
          { phone: { $regex: filter.search, $options: 'i' } },
        ];
      }

      if (typeof filter.isActive === 'boolean') {
        query.isActive = filter.isActive;
      }

      if (filter.hospitalId) {
        if (!Types.ObjectId.isValid(filter.hospitalId)) {
          throw new BadRequestException('Invalid hospitalId provided');
        }
        query.hospitalId = filter.hospitalId;
      }

      if (filter.roleId) {
        if (!Types.ObjectId.isValid(filter.roleId)) {
          throw new BadRequestException('Invalid roleId provided');
        }
        query.roleId = filter.roleId;
      }

      const sortBy = this.safeSortField(
        filter.sortBy,
        ['createdAt', 'updatedAt', 'name', 'email', 'phone'],
        'createdAt',
      );
      const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

      const [staffList, totalItems] = await Promise.all([
        this.staffModel
          .find(query)
          .populate({ path: 'roleId', select: 'name permissions isActive' })
          .populate('hospitalId', 'name code isActive')
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.staffModel.countDocuments(query),
      ]);

      return {
        data: staffList,
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (err) {
      throw this.handleServiceError(err, 'Failed to fetch staff');
    }
  }

  async getStaffById(id: string): Promise<Staff> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid staff Id provided');
    }
    try {
      const staff = await this.staffModel
        .findById(id)
        .populate({ path: 'roleId', select: 'name permissions' })
        .populate('hospitalId', 'name code isActive')
        .exec();

      if (!staff) {
        throw new NotFoundException('Staff not found');
      }

      return staff;
    } catch (err) {
      throw this.handleServiceError(err, 'Failed to fetch staff');
    }
  }

  async getStaffByHospitalId(hospitalId: string): Promise<Staff[]> {
    if (!Types.ObjectId.isValid(hospitalId)) {
      throw new BadRequestException('Invalid hospitalId provided');
    }
    try {
      const staffList = await this.staffModel
        .find({ hospitalId: hospitalId })
        .populate({ path: 'roleId', select: 'name permissions isActive' })
        .populate('hospitalId', 'name code isActive')
        .exec();

      return staffList;
    } catch (err) {
      throw this.handleServiceError(err, 'Failed to fetch staff by hospitalId');
    }
  }

  async updateStaff(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    try {
      const staff = await this.staffModel.findById(id);

      if (!staff) {
        throw new NotFoundException('Staff not found');
      }
      if (updateStaffDto) {
        staff.name = updateStaffDto.name ?? staff.name;
        staff.email = updateStaffDto.email ?? staff.email;
        staff.password = updateStaffDto.password ?? staff.password;
        staff.phone = updateStaffDto.phone ?? staff.phone;
      }
      await staff.save();

      return staff;
    } catch (err) {
      throw this.handleServiceError(err, 'Failed to update staff');
    }
  }

  async deleteStaff(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid staff Id provided');
    }
    try {
      const staff = await this.staffModel.findById(id);
      if (!staff) {
        throw new NotFoundException('Staff not found');
      }

      await this.staffModel.findByIdAndDelete(id);
    } catch (err) {
      throw this.handleServiceError(err, 'Failed to delete staff');
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
      return error;
    }

    const stack = error instanceof Error ? error.stack : undefined;
    if (stack) {
      this.logger.error(fallbackMessage, stack);
    } else {
      this.logger.error(fallbackMessage);
    }

    return new InternalServerErrorException(fallbackMessage);
  }
}
