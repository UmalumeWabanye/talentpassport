export type AuthProvider = 'authjs' | 'clerk';

export type AccessTokenPayload = {
  email: string;
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
  provider: AuthProvider;
  refreshTokenHash: string;
  subject: string;
};
