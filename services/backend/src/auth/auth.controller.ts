import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  Version
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import type { AuthContext } from './rbac/auth-context.types';
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @Version('1')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('token')
  @Version('1')
  token(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @Version('1')
  refresh(@Body() dto: RefreshSessionDto) {
    return this.authService.refresh(dto.sessionId, dto.refreshToken);
  }

  @Post('logout')
  @Version('1')
  logout(@Body() dto: LogoutSessionDto) {
    return this.authService.logout(dto.sessionId);
  }

  @Get('me')
  @Version('1')
  @UseGuards(AccessTokenGuard)
  me(@Req() request: { authUser: AuthContext }) {
    return {
      permissions: request.authUser.permissions,
      sessionId: request.authUser.sid,
      role: request.authUser.role,
      subject: request.authUser.sub,
      email: request.authUser.email
    };
  }

  @Get('admin')
  @Version('1')
  @UseGuards(AccessTokenGuard)
  admin(@Req() request: { authUser: AuthContext }) {
    if (request.authUser.role !== 'admin') {
      throw new ForbiddenException('Insufficient role');
    }

    if (!request.authUser.permissions.includes('admin:read')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return {
      email: request.authUser.email,
      permissions: request.authUser.permissions,
      role: request.authUser.role,
      sessionId: request.authUser.sid
    };
  }
}
