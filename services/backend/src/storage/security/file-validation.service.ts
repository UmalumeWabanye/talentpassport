import { BadRequestException, Injectable, PayloadTooLargeException } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';

type ValidatedUploadInput = {
  extension: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
};

const EXTENSION_MIME_MAP: Record<string, string[]> = {
  csv: ['text/csv'],
  jpeg: ['image/jpeg'],
  jpg: ['image/jpeg'],
  pdf: ['application/pdf'],
  png: ['image/png'],
  txt: ['text/plain'],
};

@Injectable()
export class FileValidationService {
  constructor(private readonly configService: AppConfigService) {}

  validateUpload(params: {
    mimeType: string;
    originalName: string;
    sizeBytes: number;
  }): ValidatedUploadInput {
    const normalizedMime = params.mimeType.trim().toLowerCase();

    if (!this.configService.storageAllowedMimeTypes.has(normalizedMime)) {
      throw new BadRequestException('File MIME type is not allowed');
    }

    const safeName = this.sanitizeOriginalName(params.originalName);
    const extension = this.extractExtension(safeName);

    const allowedForExtension = EXTENSION_MIME_MAP[extension] ?? [];

    if (!allowedForExtension.includes(normalizedMime)) {
      throw new BadRequestException('File extension does not match declared MIME type');
    }

    if (params.sizeBytes > this.configService.storageMaxFileSizeBytes) {
      throw new PayloadTooLargeException('File exceeds maximum allowed size');
    }

    return {
      extension,
      mimeType: normalizedMime,
      originalName: safeName,
      sizeBytes: params.sizeBytes,
    };
  }

  private sanitizeOriginalName(name: string) {
    const baseName = name.split(/[\\/]/).pop()?.trim() ?? '';

    if (!baseName) {
      throw new BadRequestException('Original filename is required');
    }

    const cleaned = baseName
      .replace(/[^A-Za-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^\.+/, '');

    if (!cleaned || cleaned === '.' || cleaned === '..') {
      throw new BadRequestException('Original filename is invalid');
    }

    return cleaned.slice(0, 180);
  }

  private extractExtension(safeName: string) {
    const extension = safeName.split('.').pop()?.toLowerCase();

    if (!extension || extension === safeName.toLowerCase()) {
      throw new BadRequestException('File extension is required');
    }

    if (!Object.hasOwn(EXTENSION_MIME_MAP, extension)) {
      throw new BadRequestException('File extension is not allowed');
    }

    return extension;
  }
}
