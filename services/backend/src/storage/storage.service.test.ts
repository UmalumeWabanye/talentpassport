import { describe, expect, it } from 'vitest';

import type { AppConfigService } from '../config/app-config.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageProviderFactory } from './providers/storage-provider.factory';
import { FileValidationService } from './security/file-validation.service';
import { StorageService } from './storage.service';

type FileMetadataEntity = {
  checksum: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  id: string;
  mimeType: string;
  organizationId: string;
  originalName: string;
  sizeBytes: number;
  storageKey: string;
  updatedAt: Date;
  uploadedById: string | null;
};

function createServiceHarness(options?: {
  malwareResult?: { status: 'clean' | 'infected' | 'skipped' };
}) {
  const files = new Map<string, FileMetadataEntity>();

  const config = {
    storageAllowedMimeTypes: new Set(['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'text/csv']),
    storageMaxFileSizeBytes: 10 * 1024 * 1024,
    storageProvider: 'local',
    storagePublicBaseUrl: 'http://localhost:4000/api/v1',
    storageSignedUrlTtlSeconds: 900,
    storageSigningSecret: 'test-signing-secret',
  } as AppConfigService;

  const prismaClient = {
    fileMetadata: {
      create: async ({ data }: { data: Omit<FileMetadataEntity, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt'> }) => {
        const now = new Date();
        const next: FileMetadataEntity = {
          checksum: data.checksum,
          createdAt: now,
          deletedAt: null,
          id: `file-${files.size + 1}`,
          mimeType: data.mimeType,
          organizationId: data.organizationId,
          originalName: data.originalName,
          sizeBytes: data.sizeBytes,
          storageKey: data.storageKey,
          updatedAt: now,
          uploadedById: data.uploadedById,
        };

        files.set(next.id, next);
        return next;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return files.get(where.id) ?? null;
      },
    },
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => {
        if (where.email === 'user@talentpassport.local') {
          return { id: 'user-1' };
        }

        return null;
      },
    },
  };

  const prismaService = {
    client: async () => prismaClient,
  };

  const localProvider = new LocalStorageProvider(config);
  const providerFactory = new StorageProviderFactory(config, localProvider);
  const validationService = new FileValidationService(config);
  const malwareScanner = {
    scanUploadCandidate: async () => options?.malwareResult ?? { status: 'clean' as const },
  };
  const service = new StorageService(
    config,
    prismaService as never,
    providerFactory,
    validationService,
    malwareScanner,
  );

  return { service };
}

describe('StorageService', () => {
  it('creates upload metadata and signed URL with tenant boundary enforcement', async () => {
    const { service } = createServiceHarness();
    const reservation = await service.createUploadReservation({
      checksum: 'abc123',
      mimeType: 'application/pdf',
      organizationId: 'org-1',
      originalName: 'portfolio.pdf',
      requestTenantId: 'org-1',
      sizeBytes: 4096,
      uploaderEmail: 'user@talentpassport.local',
    });

    expect(reservation.file.organizationId).toBe('org-1');
    expect(reservation.file.uploadedById).toBe('user-1');
    expect(reservation.upload.method).toBe('PUT');
    expect(reservation.upload.url).toContain('/storage/object/upload/');
  });

  it('returns a signed download URL for an existing file', async () => {
    const { service } = createServiceHarness();
    const reservation = await service.createUploadReservation({
      mimeType: 'application/pdf',
      organizationId: 'org-2',
      originalName: 'resume.pdf',
      requestTenantId: 'org-2',
      sizeBytes: 2048,
    });

    const download = await service.createDownloadReservation({
      fileId: reservation.file.id,
      requestTenantId: 'org-2',
    });

    expect(download.file.id).toBe(reservation.file.id);
    expect(download.download.method).toBe('GET');
    expect(download.download.url).toContain('/storage/object/download/');
    expect(download.download.url).toContain('signature=');
  });

  it('rejects uploads with disallowed MIME types', async () => {
    const { service } = createServiceHarness();

    await expect(
      service.createUploadReservation({
        mimeType: 'application/x-msdownload',
        organizationId: 'org-2',
        originalName: 'script.exe',
        requestTenantId: 'org-2',
        sizeBytes: 2048,
      }),
    ).rejects.toThrow('File MIME type is not allowed');
  });

  it('rejects uploads flagged by malware scanner', async () => {
    const { service } = createServiceHarness({
      malwareResult: { status: 'infected' },
    });

    await expect(
      service.createUploadReservation({
        mimeType: 'application/pdf',
        organizationId: 'org-7',
        originalName: 'cv.pdf',
        requestTenantId: 'org-7',
        sizeBytes: 1024,
      }),
    ).rejects.toThrow('File failed malware scan');
  });
});
