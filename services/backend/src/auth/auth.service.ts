import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

import { RedisService } from '../cache/redis.service';
import { AppConfigService } from '../config/app-config.service';
import type { AuthContext } from './rbac/auth-context.types';
import { ROLE_PERMISSIONS } from './rbac/rbac.types';
import type { RbacPermission } from './rbac/rbac.types';
import type { RbacRole } from './rbac/rbac.types';
import type {
  AccessTokenPayload,
  AuthProvider,
  RefreshTokenPayload,
  SessionRecord
} from './types/auth-session.types';

@Injectable()
export class AuthService {
  private readonly inMemorySessions = new Map<string, SessionRecord>();
  private readonly inMemoryUsers = new Map<string, string>();

  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
    @Inject(RedisService) private readonly redisService: RedisService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    this.assertLocalAuthProvider();
    const normalizedEmail = email.toLowerCase();
    const role = this.roleForEmail(normalizedEmail);
    const permissions = [...ROLE_PERMISSIONS[role]];
    const existingHash = await this.getUserHash(normalizedEmail);

    if (existingHash) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id
    });

    await this.saveUserHash(normalizedEmail, passwordHash);

    return {
      email: normalizedEmail,
      provider: this.configService.authProvider,
      permissions,
      role
    };
  }

  async login(email: string, password: string) {
    this.assertLocalAuthProvider();
    const normalizedEmail = email.toLowerCase();
    const passwordHash = await this.getUserHash(normalizedEmail);

    if (!passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await argon2.verify(passwordHash, password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSessionTokens({
      email: normalizedEmail,
      provider: this.configService.authProvider,
      subject: normalizedEmail
    });
  }

  async refresh(sessionId: string, refreshToken: string) {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.jwtRefreshSecret
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    if (payload.typ !== 'refresh' || payload.sid !== sessionId || payload.sub !== session.subject) {
      throw new UnauthorizedException('Refresh token does not match session');
    }

    const tokenHashMatches = await argon2.verify(session.refreshTokenHash, refreshToken);

    if (!tokenHashMatches) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    return this.issueSessionTokens({
      email: session.email,
      provider: session.provider,
      sessionId,
      subject: session.subject,
      permissions: session.permissions,
      role: session.role
    });
  }

  async logout(sessionId: string) {
    await this.deleteSession(sessionId);

    return {
      revoked: true,
      sessionId
    };
  }

  async verifyAccessToken(accessToken: string): Promise<AuthContext> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken, {
        secret: this.configService.jwtAccessSecret
      });

      if (payload.typ !== 'access') {
        throw new UnauthorizedException('Access token type is invalid');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Access token is invalid');
    }
  }

  private assertLocalAuthProvider() {
    if (this.configService.authProvider !== 'authjs') {
      throw new BadRequestException('Registration and password login are available only for AUTH_PROVIDER=authjs');
    }
  }

  private async issueSessionTokens(params: {
    email: string;
    permissions?: RbacPermission[];
    provider: AuthProvider;
    role?: RbacRole;
    sessionId?: string;
    subject: string;
  }) {
    const sessionId = params.sessionId ?? randomUUID();
    const role = params.role ?? this.roleForEmail(params.email);
    const permissions = params.permissions ?? [...ROLE_PERMISSIONS[role]];
    const refreshExpiresAt = Date.now() + this.configService.jwtRefreshTtlSeconds * 1000;

    const refreshToken = await this.jwtService.signAsync(
      {
        sid: sessionId,
        sub: params.subject,
        typ: 'refresh'
      },
      {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: `${this.configService.jwtRefreshTtlSeconds}s`
      },
    );

    const accessToken = await this.jwtService.signAsync(
      {
        email: params.email,
        permissions,
        role,
        sid: sessionId,
        sub: params.subject,
        typ: 'access'
      },
      {
        secret: this.configService.jwtAccessSecret,
        expiresIn: `${this.configService.jwtAccessTtlSeconds}s`
      },
    );

    const refreshTokenHash = await argon2.hash(refreshToken, {
      type: argon2.argon2id
    });

    const session: SessionRecord = {
      email: params.email,
      expiresAt: refreshExpiresAt,
      permissions,
      provider: params.provider,
      refreshTokenHash,
      role,
      subject: params.subject
    };

    await this.saveSession(sessionId, session);

    return {
      accessToken,
      accessTokenTtlSeconds: this.configService.jwtAccessTtlSeconds,
      refreshToken,
      refreshTokenTtlSeconds: this.configService.jwtRefreshTtlSeconds,
      sessionId,
      tokenType: 'Bearer'
    };
  }

  private async saveSession(sessionId: string, session: SessionRecord) {
    const stored = await this.redisService.set(
      this.sessionKey(sessionId),
      JSON.stringify(session),
      this.configService.jwtRefreshTtlSeconds,
    );

    if (!stored) {
      this.inMemorySessions.set(sessionId, session);
    }
  }

  private async getSession(sessionId: string) {
    const cached = await this.redisService.get(this.sessionKey(sessionId));

    if (cached) {
      return JSON.parse(cached) as SessionRecord;
    }

    const inMemorySession = this.inMemorySessions.get(sessionId);

    if (!inMemorySession) {
      return null;
    }

    if (Date.now() > inMemorySession.expiresAt) {
      this.inMemorySessions.delete(sessionId);
      return null;
    }

    return inMemorySession;
  }

  private async deleteSession(sessionId: string) {
    this.inMemorySessions.delete(sessionId);
    await this.redisService.del(this.sessionKey(sessionId));
  }

  private async saveUserHash(email: string, passwordHash: string) {
    const stored = await this.redisService.set(this.userKey(email), passwordHash);

    if (!stored) {
      this.inMemoryUsers.set(email, passwordHash);
    }
  }

  private async getUserHash(email: string) {
    const cachedHash = await this.redisService.get(this.userKey(email));

    if (cachedHash) {
      return cachedHash;
    }

    return this.inMemoryUsers.get(email) ?? null;
  }

  private sessionKey(sessionId: string) {
    return `auth:session:${sessionId}`;
  }

  private userKey(email: string) {
    return `auth:user:${email}`;
  }

  private roleForEmail(email: string): RbacRole {
    return this.configService.authAdminEmails.has(email.toLowerCase()) ? 'admin' : 'user';
  }
}
