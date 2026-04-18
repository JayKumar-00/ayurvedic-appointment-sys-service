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
import {
  AdminUser,
  AdminUserDocument,
} from '../admin-user/schemas/admin-user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleFilterDto } from './dto/role-filter.dto';
import { RoleListResponseDto } from './dto/role-list.response.dto';
import { RoleResponseDto } from './dto/role.response.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { Types } from 'mongoose';
import { Staff, StaffDocument } from '../entity/user.entity';

@Injectable()
export class RolePermissionService {
  private readonly logger = new Logger(RolePermissionService.name);

  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    try {
      if (!Types.ObjectId.isValid(createRoleDto.hospitalId)) {
        throw new BadRequestException(
          'Hospital ID should be a valid mongoId string',
        );
      }
      const existingRole = await this.roleModel.findOne({
        hospitalId: createRoleDto.hospitalId,
        name: createRoleDto.name,
      });

      if (existingRole) {
        throw new ConflictException(
          'Role with this name already exists in this hospital',
        );
      }

      const role = await this.roleModel.create({
        name: createRoleDto.name,
        hospitalId: createRoleDto.hospitalId,
        permissions: createRoleDto.permissions,
        isActive: true,
      });

      return this.toRoleResponse(role);
    } catch (error) {
      throw this.handleError(error, 'Error creating role');
    }
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    try {
      const role = await this.roleModel.findById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      role.permissions = dto.permissions;
      await role.save();

      return this.toRoleResponse(role);
    } catch (error) {
      throw this.handleError(error, 'Error updating role permissions');
    }
  }

  async updateRoleStatus(roleId: string, dto: UpdateRoleStatusDto) {
    try {
      const role = await this.roleModel.findById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      role.isActive = dto.isActive;
      await role.save();

      return this.toRoleResponse(role);
    } catch (error) {
      throw this.handleError(error, 'Error updating role status');
    }
  }

  async getRoles(filter: RoleFilterDto): Promise<RoleListResponseDto> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.hospitalId) {
      query.hospitalId = filter.hospitalId;
    }

    if (typeof filter.isActive === 'boolean') {
      query.isActive = filter.isActive;
    }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { 'permissions.module': { $regex: filter.search, $options: 'i' } },
      ];
    }

    const sortBy = this.safeSortField(
      filter.sortBy,
      ['createdAt', 'updatedAt', 'name'],
      'createdAt',
    );
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [roles, totalItems] = await Promise.all([
      this.roleModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      this.roleModel.countDocuments(query),
    ]);

    return {
      data: roles.map((role) => this.toRoleResponse(role)),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async deleteRole(roleId: string) {
    try {
      const role = await this.roleModel.findById(roleId);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      const staff = await this.staffModel.findOne({ roleId: role._id });

      if (staff) {
        throw new ConflictException('Cannot delete role assigned to staff');
      }

      await role.deleteOne();
      return { message: 'Role deleted successfully' };
    } catch (err) {
      throw this.handleError(err, 'Error deleting role');
    }
  }

  async getRoleByID(id: string) {
    try {
      const roleId = await this.roleModel
        .findById(id)
        .populate('permissions')
        .populate('hospitalId', 'name code address')
        .exec();
      if (!roleId) {
        throw new NotFoundException('Role not found');
      }
      return this.toRoleResponse(roleId);
    } catch (err) {
      throw this.handleError(err, 'Error fetching role by ID');
    }
  }

  private toRoleResponse(role: RoleDocument): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      hospitalId: new Types.ObjectId(role.hospitalId),
      isActive: role.isActive,
      permissions: role.permissions.map((permission) => ({
        module: permission.module,
        create: permission.create,
        read: permission.read,
        update: permission.update,
        delete: permission.delete,
        export: permission.export,
        report: permission.report,
      })),
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

  private handleError(error: unknown, fallbackMessage: string): Error {
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
