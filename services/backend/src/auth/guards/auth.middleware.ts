import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import type { AuthContext } from '../rbac/auth-context.types';
import { ROLE_PERMISSIONS } from '../rbac/rbac.types';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  use(request: { authUser?: AuthContext }, _response: unknown, next: () => void) {
    if (request.authUser && !request.authUser.permissions.length) {
      request.authUser.permissions = [...ROLE_PERMISSIONS[request.authUser.role]];
    }

    next();
  }
}
