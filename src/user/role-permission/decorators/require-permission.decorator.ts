import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../types/permission-action.type';

export const REQUIRED_PERMISSION_KEY = 'required_permission';

export type RequiredPermission = {
  module: string;
  action: PermissionAction;
};

export const RequirePermission = (
  module: string,
  action: PermissionAction,
) => SetMetadata(REQUIRED_PERMISSION_KEY, { module, action } satisfies RequiredPermission);
