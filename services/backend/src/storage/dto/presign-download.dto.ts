import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PresignDownloadDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  downloadName?: string;
}
