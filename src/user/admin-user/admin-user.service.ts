import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { CreateHospitalAdminDto } from './dto/create-hospital-admin.dto';
import { AdminUserFilterDto } from './dto/admin-user-filter.dto';
import { HospitalFilterDto } from './dto/hospital-filter.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { Hospital, HospitalDocument } from './schemas/hospital.schema';
import { AdminUser, AdminUserDocument } from './schemas/admin-user.schema';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { HospitalResponseDto } from './dto/hospital-response.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    @InjectModel(Hospital.name)
    private readonly hospitalModel: Model<HospitalDocument>,
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
  ) {}

  async createHospital(createHospitalDto: CreateHospitalDto) {
    try {
      const existingHospitalByName = await this.hospitalModel.findOne({
        name: createHospitalDto.name,
      });
      if (existingHospitalByName) {
        throw new ConflictException('Hospital with this name already exists');
      }

      const generatedCode = await this.generateUniqueHospitalCode(
        createHospitalDto.name,
      );

      const hospital = await this.hospitalModel.create({
        name: createHospitalDto.name,
        code: generatedCode,
        address: createHospitalDto.address,
        phone: createHospitalDto.phone,
        isActive: true,
      });

      return {
        id: hospital.id,
        name: hospital.name,
        code: hospital.code,
        address: hospital.address,
        phone: hospital.phone,
        isActive: hospital.isActive,
      };
    } catch (error) {
      throw this.handleServiceError(error, 'Error creating hospital');
    }
  }

  private async generateUniqueHospitalCode(hospitalName: string): Promise<string> {
    const sanitized = hospitalName
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 4);

    const prefix = sanitized || 'HOSP';

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const randomPart = Math.floor(100 + Math.random() * 900).toString();
      const candidate = `${prefix}-${Date.now().toString().slice(-6)}-${randomPart}`;
      const existing = await this.hospitalModel.findOne({ code: candidate });
      if (!existing) {
        return candidate;
      }
    }

    const fallback = `${prefix}-${new Date().getTime()}-${Math.floor(
      Math.random() * 10000,
    )}`;

    return fallback;
  }

  async createHospitalAdmin(
    hospitalId: string,
    createHospitalAdminDto: CreateHospitalAdminDto,
  ) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId);
      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      const existingAdmin = await this.adminUserModel.findOne({
        hospitalId,
        isAdmin: true,
      });

      if (existingAdmin) {
        throw new BadRequestException('This hospital already has an admin');
      }

      const existingEmail = await this.adminUserModel.findOne({
        email: createHospitalAdminDto.email,
      });

      if (existingEmail) {
        throw new BadRequestException('User with this email already exists');
      }

      const passwordHash = await bcrypt.hash(
        createHospitalAdminDto.password,
        10,
      );

      const admin = await this.adminUserModel.create({
        name: createHospitalAdminDto.name,
        email: createHospitalAdminDto.email,
        passwordHash,
        hospitalId,
        isAdmin: true,
        isSystemAdmin: false,
        isActive: true,
      });

      return this.toAdminUserResponse(admin);
    } catch (error) {
      throw this.handleServiceError(error, 'Error creating admin');
    }
  }

  async findAllAdminUsers() {
    return this.findAllAdminUsersWithFilters({});
  }

  async findAllAdminUsersWithFilters(filter: AdminUserFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { hospitalId: { $regex: filter.search, $options: 'i' } },
      ];
    }

    if (filter.hospitalId) query.hospitalId = filter.hospitalId;
    if (typeof filter.isAdmin === 'boolean') query.isAdmin = filter.isAdmin;
    if (typeof filter.isSystemAdmin === 'boolean') {
      query.isSystemAdmin = filter.isSystemAdmin;
    }
    if (typeof filter.isActive === 'boolean') query.isActive = filter.isActive;

    const sortBy = this.safeSortField(
      filter.sortBy,
      ['createdAt', 'updatedAt', 'name', 'email', 'hospitalId'],
      'createdAt',
    );
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [users, totalItems] = await Promise.all([
      this.adminUserModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      this.adminUserModel.countDocuments(query),
    ]);

    return {
      data: users.map((user) => this.toAdminUserResponse(user)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOneAdminUser(id: string) {
    const user = await this.adminUserModel.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    return this.toAdminUserResponse(user);
  }

  async findAllHospitals(filter: HospitalFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { code: { $regex: filter.search, $options: 'i' } },
        { address: { $regex: filter.search, $options: 'i' } },
        { phone: { $regex: filter.search, $options: 'i' } },
      ];
    }

    if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
    if (filter.code) query.code = { $regex: filter.code, $options: 'i' };
    if (typeof filter.isActive === 'boolean') query.isActive = filter.isActive;

    const sortBy = this.safeSortField(
      filter.sortBy,
      ['createdAt', 'updatedAt', 'name', 'code'],
      'createdAt',
    );
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [hospitals, totalItems] = await Promise.all([
      this.hospitalModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      this.hospitalModel.countDocuments(query),
    ]);

    return {
      data: hospitals.map((hospital) => this.toHospitalResponse(hospital)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOneHospital(id: string) {
    const hospital = await this.hospitalModel.findById(id);
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return this.toHospitalResponse(hospital);
  }

  async changeHospitalStauts(id: string, isActive: boolean) {
    try {
      const hospitalId = await this.hospitalModel.findById(id).exec();

      if (!hospitalId) {
        throw new NotFoundException('Hospital not found');
      }

      await this.hospitalModel
        .findByIdAndUpdate(id, { isActive }, { new: true })
        .exec();

      await this.adminUserModel
        .updateMany({ hospitalId: id }, { isActive })
        .exec();

      return {
        message: `Hospital ${isActive ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      throw new Logger('SystemAdmin').error(
        'Error changing hospital status',
        error,
      );
    }
  }

  async updateHospitalDetail(id: string, updateHospitalDto: UpdateHospitalDto) {
    try {
      const hospitalId = await this.hospitalModel.findById(id).exec();

      if (!hospitalId) {
        throw new NotFoundException('Hospital not found');
      }

      if (hospitalId.isActive === false) {
        throw new BadRequestException('Hospital is already inactive');
      }

      if (updateHospitalDto) {
        hospitalId.name = updateHospitalDto.name ?? hospitalId.name;
        hospitalId.address = updateHospitalDto.address ?? hospitalId.address;
        hospitalId.phone = updateHospitalDto.phone ?? hospitalId.phone;
      }
      await hospitalId.save();

      return this.toHospitalResponse(hospitalId);
    } catch (err) {
      throw new Logger('SystemAdmin').error(
        'Error updating hospital details',
        err,
      );
    }
  }

  async updateAdminUser(id: string, updateAdminUserDto: UpdateAdminUserDto) {
    const user = await this.adminUserModel.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    if (typeof updateAdminUserDto.name === 'string') {
      user.name = updateAdminUserDto.name;
    }

    if (typeof updateAdminUserDto.phone === 'string') {
      user.phone = updateAdminUserDto.phone;
    }

    if (typeof updateAdminUserDto.address === 'string') {
      user.address = updateAdminUserDto.address;
    }

    if (typeof updateAdminUserDto.isActive === 'boolean') {
      user.isActive = updateAdminUserDto.isActive;
    }

    await user.save();
    return this.toAdminUserResponse(user);
  }

  async removeAdminUser(id: string) {
    const user = await this.adminUserModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    return { message: 'Admin user deleted successfully' };
  }

  async removeHospital(id: string) {
    try {
      const hospitalId = await this.hospitalModel.findById(id).exec();

      if (!hospitalId) {
        throw new NotFoundException('Hospital not found');
      }

      await this.hospitalModel.findByIdAndDelete(id).exec();

      await this.adminUserModel.deleteMany({ hospitalId: id }).exec();
    } catch (err) {
      throw new Logger('SystemAdmin').error('Error deleting hospital', err);
    }
  }

  async changeAdminPassword(
    id: string,
    changeAdminPasswordDto: ChangeAdminPasswordDto,
  ) {
    const user = await this.adminUserModel.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    user.passwordHash = await bcrypt.hash(changeAdminPasswordDto.password, 10);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  private toAdminUserResponse(user: AdminUserDocument): AdminUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      hospitalId: user.hospitalId ?? '',
      isAdmin: user.isAdmin,
      isSystemAdmin: user.isSystemAdmin,
      isActive: user.isActive,
    };
  }

  private toHospitalResponse(hospital: HospitalDocument): HospitalResponseDto {
    return {
      id: hospital.id,
      name: hospital.name,
      code: hospital.code,
      address: hospital.address,
      phone: hospital.phone,
      isActive: hospital.isActive,
    };
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

    if (this.isDuplicateKeyError(error)) {
      const duplicateMessage = this.getDuplicateKeyMessage(error);
      return new ConflictException(duplicateMessage);
    }

    const stack = error instanceof Error ? error.stack : undefined;
    if (stack) {
      this.logger.error(fallbackMessage, stack);
    } else {
      this.logger.error(fallbackMessage);
    }

    return new InternalServerErrorException(fallbackMessage);
  }

  private isDuplicateKeyError(error: unknown): error is {
    code: number;
    keyValue?: Record<string, unknown>;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private getDuplicateKeyMessage(error: unknown): string {
    if (!this.isDuplicateKeyError(error) || !error.keyValue) {
      return 'Duplicate record exists';
    }

    const keys = Object.keys(error.keyValue);
    if (keys.includes('email')) {
      return 'User with this email already exists';
    }
    if (keys.includes('code')) {
      return 'Hospital with this code already exists';
    }
    if (keys.includes('hospitalId') && keys.includes('isAdmin')) {
      return 'This hospital already has an admin';
    }

    return 'Duplicate record exists';
  }
}
