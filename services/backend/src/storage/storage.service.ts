import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../database/prisma.service';
import { StorageProviderFactory } from './providers/storage-provider.factory';
import { FileValidationService } from './security/file-validation.service';
import type { MalwareScanner } from './security/malware-scanner.interface';
import { NoopMalwareScannerService } from './security/noop-malware-scanner.service';
import type { SignedUrlResult, StorageFileMetadataRecord } from './storage.types';

type FileMetadataModel = {
  checksum: string | null;
  createdAt: Date;
  id: string;
  mimeType: string;
  organizationId: string;
  originalName: string;
  sizeBytes: number;
  storageKey: string;
  updatedAt: Date;
  uploadedById: string | null;
};

@Injectable()
export class StorageService {
  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(StorageProviderFactory) private readonly providerFactory: StorageProviderFactory,
    @Inject(FileValidationService) private readonly validationService: FileValidationService,
    @Inject(NoopMalwareScannerService) private readonly malwareScanner: MalwareScanner,
  ) {}

  async createUploadReservation(params: {
    checksum?: string;
    mimeType: string;
    organizationId: string;
    originalName: string;
    requestTenantId?: string;
    sizeBytes: number;
    uploaderEmail?: string;
  }) {
    this.assertTenantBoundary(params.organizationId, params.requestTenantId);
    const validated = this.validationService.validateUpload({
      mimeType: params.mimeType,
      originalName: params.originalName,
      sizeBytes: params.sizeBytes,
    });
    const scanResult = await this.malwareScanner.scanUploadCandidate({
      checksum: params.checksum,
      mimeType: validated.mimeType,
      organizationId: params.organizationId,
      originalName: validated.originalName,
      sizeBytes: validated.sizeBytes,
    });

    if (scanResult.status === 'infected') {
      throw new BadRequestException('File failed malware scan');
    }

    const client = await this.prismaService.client();
    const storageKey = this.buildStorageKey(params.organizationId, validated.extension);
    const uploader = params.uploaderEmail
      ? await client.user.findUnique({
          where: {
            email: params.uploaderEmail.toLowerCase(),
          },
        })
      : null;

    const metadata = await client.fileMetadata.create({
      data: {
        checksum: params.checksum ?? null,
        mimeType: validated.mimeType,
        organizationId: params.organizationId,
        originalName: validated.originalName,
        sizeBytes: validated.sizeBytes,
        storageKey,
        uploadedById: uploader?.id ?? null,
      },
    });

    const provider = this.providerFactory.getProvider();
    const signedUrl = provider.signUploadUrl({
      contentType: validated.mimeType,
      expiresAt: this.getExpirationDate(),
      key: storageKey,
    });

    return {
      file: this.toMetadataRecord(metadata),
      upload: signedUrl,
    };
  }

  async createDownloadReservation(params: {
    downloadName?: string;
    fileId: string;
    requestTenantId?: string;
  }): Promise<{ download: SignedUrlResult; file: StorageFileMetadataRecord }> {
    const metadata = await this.requireFileMetadata(params.fileId);

    this.assertTenantBoundary(metadata.organizationId, params.requestTenantId);

    const provider = this.providerFactory.getProvider();
    const signedUrl = provider.signDownloadUrl({
      expiresAt: this.getExpirationDate(),
      key: metadata.storageKey,
    });

    return {
      file: this.toMetadataRecord(metadata),
      download: signedUrl,
    };
  }

  async getMetadata(fileId: string, requestTenantId?: string) {
    const metadata = await this.requireFileMetadata(fileId);

    this.assertTenantBoundary(metadata.organizationId, requestTenantId);

    return this.toMetadataRecord(metadata);
  }

  private async requireFileMetadata(fileId: string): Promise<FileMetadataModel> {
    const client = await this.prismaService.client();
    const metadata = await client.fileMetadata.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!metadata || metadata.deletedAt) {
      throw new NotFoundException('File metadata not found');
    }

    return metadata;
  }

  private assertTenantBoundary(targetOrganizationId: string, requestTenantId?: string) {
    if (!requestTenantId || requestTenantId !== targetOrganizationId) {
      throw new ForbiddenException('Cross-tenant file access denied');
    }
  }

  private buildStorageKey(organizationId: string, extension: string) {
    return `${organizationId}/${randomUUID()}.${extension}`;
  }

  private getExpirationDate() {
    return new Date(Date.now() + this.configService.storageSignedUrlTtlSeconds * 1000);
  }

  private toMetadataRecord(model: FileMetadataModel): StorageFileMetadataRecord {
    return {
      checksum: model.checksum,
      createdAt: model.createdAt.toISOString(),
      id: model.id,
      mimeType: model.mimeType,
      organizationId: model.organizationId,
      originalName: model.originalName,
      sizeBytes: model.sizeBytes,
      storageKey: model.storageKey,
      updatedAt: model.updatedAt.toISOString(),
      uploadedById: model.uploadedById,
    };
  }
}
