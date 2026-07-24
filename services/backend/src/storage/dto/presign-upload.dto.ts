import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class PresignUploadDto {
  @IsString()
  @MaxLength(120)
  organizationId!: string;

  @IsString()
  @MaxLength(255)
  originalName!: string;

  @IsString()
  @MaxLength(120)
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  checksum?: string;
}
