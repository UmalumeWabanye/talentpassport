import { SetMetadata } from '@nestjs/common';

import type { RbacPermission } from './rbac.types';

export const PERMISSIONS_KEY = 'rbac:permissions';

export const Permissions = (...permissions: RbacPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
