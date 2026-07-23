import { SetMetadata } from '@nestjs/common';

import type { RbacRole } from './rbac.types';

export const ROLES_KEY = 'rbac:roles';

export const Roles = (...roles: RbacRole[]) => SetMetadata(ROLES_KEY, roles);
