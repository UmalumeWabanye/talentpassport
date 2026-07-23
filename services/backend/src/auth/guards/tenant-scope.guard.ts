import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

import type { AuthContext } from '../rbac/auth-context.types';

@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      authUser?: AuthContext;
      params?: { tenantId?: string };
      tenantId?: string;
    }>();

    const tenantId = request.tenantId;
    const scopedTenantId = request.params?.tenantId;

    if (!request.authUser) {
      throw new ForbiddenException('Missing authorization context');
    }

    if (!tenantId || !scopedTenantId) {
      throw new ForbiddenException('Missing tenant context');
    }

    if (tenantId !== scopedTenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return true;
  }
}