import type { RbacPermission, RbacRole } from '../rbac/rbac.types';

export type AuthProvider = 'authjs' | 'clerk';

export type AccessTokenPayload = {
  email: string;
  permissions: RbacPermission[];
  role: RbacRole;
  sid: string;
  sub: string;
  typ: 'access';
};

export type RefreshTokenPayload = {
  sid: string;
  sub: string;
  typ: 'refresh';
};

export type SessionRecord = {
  email: string;
  expiresAt: number;
  permissions: RbacPermission[];
  provider: AuthProvider;
  refreshTokenHash: string;
  role: RbacRole;
  subject: string;
};
