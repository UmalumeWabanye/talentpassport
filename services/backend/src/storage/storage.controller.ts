import { Body, Controller, Get, Inject, Param, Post, Req, Version } from '@nestjs/common';

import { PresignDownloadDto } from './dto/presign-download.dto';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(@Inject(StorageService) private readonly storageService: StorageService) {}

  @Post('files/presign-upload')
  @Version('1')
  presignUpload(
    @Req() request: { authUser?: { email?: string }; tenantId?: string },
    @Body() dto: PresignUploadDto,
  ) {
    return this.storageService.createUploadReservation({
      checksum: dto.checksum,
      mimeType: dto.mimeType,
      organizationId: dto.organizationId,
      originalName: dto.originalName,
      requestTenantId: request.tenantId,
      sizeBytes: dto.sizeBytes,
      uploaderEmail: request.authUser?.email,
    });
  }

  @Post('files/:fileId/presign-download')
  @Version('1')
  presignDownload(
    @Req() request: { tenantId?: string },
    @Param('fileId') fileId: string,
    @Body() dto: PresignDownloadDto,
  ) {
    return this.storageService.createDownloadReservation({
      downloadName: dto.downloadName,
      fileId,
      requestTenantId: request.tenantId,
    });
  }

  @Get('files/:fileId/metadata')
  @Version('1')
  metadata(@Req() request: { tenantId?: string }, @Param('fileId') fileId: string) {
    return this.storageService.getMetadata(fileId, request.tenantId);
  }
}
