import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow Doctors, Receptionists, Admins, and SystemAdmins
    if (!user?.isDoctor && !user?.isReceptionist && !user?.isSystemAdmin && !user?.isAdmin) {
      throw new ForbiddenException(
        'Only Doctors, Receptionists, or Admins can perform this action',
      );
    }

    return true;
  }
}
