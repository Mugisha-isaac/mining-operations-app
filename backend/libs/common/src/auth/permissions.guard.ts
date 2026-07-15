import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { ROLE_PERMISSIONS, Permission } from '../enums/role.enum';
import { AuthenticatedUser } from './jwt.constants';

/**
 * Genuine backend enforcement of permissions, independent of whatever the
 * UI chooses to hide. Runs after JwtAuthGuard so request.user is populated.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user) throw new ForbiddenException('Not authenticated');

    const granted = ROLE_PERMISSIONS[user.role] ?? [];
    const hasAll = required.every((permission) => granted.includes(permission));
    if (!hasAll) {
      throw new ForbiddenException(`Role ${user.role} lacks required permission`);
    }
    return true;
  }
}
