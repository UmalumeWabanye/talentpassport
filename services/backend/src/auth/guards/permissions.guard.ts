import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthContext } from '../rbac/auth-context.types';
import { PERMISSIONS_KEY } from '../rbac/permissions.decorator';
import { ROLE_PERMISSIONS } from '../rbac/rbac.types';
import type { RbacPermission } from '../rbac/rbac.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride<RbacPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ authUser?: AuthContext }>();
    const authUser = request.authUser;
    const role = authUser?.role;

    if (!authUser || !role) {
      throw new ForbiddenException('Missing authorization context');
    }

    const permissions = authUser.permissions?.length ? authUser.permissions : [...ROLE_PERMISSIONS[role]];

    const hasPermission = requiredPermissions.every((permission) => permissions.includes(permission));

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
