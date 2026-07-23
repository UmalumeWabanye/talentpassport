export type RbacRole = 'admin' | 'user';
export type RbacPermission = 'admin:read' | 'auth:manage' | 'auth:read';

export const ROLE_PERMISSIONS: Record<RbacRole, readonly RbacPermission[]> = {
  admin: ['auth:manage', 'auth:read', 'admin:read'],
  user: ['auth:read']
} as const;
