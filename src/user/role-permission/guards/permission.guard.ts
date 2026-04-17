import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '../../../auth/strategies/jwt.strategy';
import {
  REQUIRED_PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/require-permission.decorator';
import { Role, RoleDocument } from '../schemas/role.schema';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(
        REQUIRED_PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.isSystemAdmin) {
      return true;
    }

    if (user.isAdmin) {
      return true;
    }

    if (!user.roleId) {
      throw new ForbiddenException('Role not assigned to user');
    }

    const role = await this.roleModel.findById(user.roleId);
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    if (!role.isActive) {
      throw new ForbiddenException('Role is inactive');
    }

    const permission = role.permissions.find(
      (item) => item.module === requiredPermission.module,
    );

    if (!permission || !permission[requiredPermission.action]) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
