import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

type AuthRequestUser = {
  isSystemAdmin?: boolean;
  isAdmin?: boolean;
};

@Injectable()
export class SystemAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthRequestUser }>();
    const user = request.user;

    if (!user?.isSystemAdmin) {
      throw new ForbiddenException('Only SystemAdmin can perform this action');
    }

    return true;
  }
}
