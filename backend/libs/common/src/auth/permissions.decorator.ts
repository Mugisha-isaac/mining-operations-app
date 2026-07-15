import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/role.enum';

export const PERMISSIONS_KEY = 'permissions';

/** Attach the permission(s) an endpoint requires. Checked by PermissionsGuard. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
