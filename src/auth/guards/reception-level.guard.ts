import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ReceptionLevelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow Receptionists, Admins, and SystemAdmins
    if (!user?.isReceptionist && !user?.isSystemAdmin && !user?.isAdmin) {
      throw new ForbiddenException(
        'Only Receptionists or Admins can perform this action',
      );
    }

    return true;
  }
}
