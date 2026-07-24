import { describe, expect, it } from 'vitest';

import type { AppConfigService } from '../config/app-config.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageProviderFactory } from './providers/storage-provider.factory';
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

function createServiceHarness() {
  const files = new Map<string, FileMetadataEntity>();

  const config = {
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
  const service = new StorageService(config, prismaService as never, providerFactory);

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
});
