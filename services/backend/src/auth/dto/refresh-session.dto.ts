import { IsString, IsUUID, MinLength } from 'class-validator';

export class RefreshSessionDto {
  @IsUUID()
  sessionId!: string;

  @IsString()
  @MinLength(24)
  refreshToken!: string;
}
