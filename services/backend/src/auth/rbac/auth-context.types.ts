import type { RbacPermission, RbacRole } from './rbac.types';

export type AuthContext = {
  email: string;
  permissions: RbacPermission[];
  role: RbacRole;
  sid: string;
  sub: string;
  typ: 'access';
};
