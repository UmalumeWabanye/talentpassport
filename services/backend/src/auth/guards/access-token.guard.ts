import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      authUser?: unknown;
      headers?: Record<string, string | undefined>;
    }>();

    const authorizationHeader = request.headers?.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const accessToken = authorizationHeader.slice('Bearer '.length).trim();
    request.authUser = await this.authService.verifyAccessToken(accessToken);

    return true;
  }
}
