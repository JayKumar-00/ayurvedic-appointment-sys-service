import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class DoctorLevelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow Doctors, Admins, and SystemAdmins
    if (!user?.isDoctor && !user?.isSystemAdmin && !user?.isAdmin) {
      throw new ForbiddenException(
        'Only Doctors, Admins, or Super Admins can perform this action',
      );
    }

    return true;
  }
}