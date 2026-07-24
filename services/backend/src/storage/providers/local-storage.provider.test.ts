import { describe, expect, it } from 'vitest';

import { LocalStorageProvider } from './local-storage.provider';
import type { AppConfigService } from '../../config/app-config.service';

describe('LocalStorageProvider', () => {
  it('generates a deterministic signed upload URL for the same payload', () => {
    const provider = new LocalStorageProvider({
      storagePublicBaseUrl: 'http://localhost:4000/api/v1',
      storageSigningSecret: 'test-signing-secret',
    } as AppConfigService);

    const expiresAt = new Date('2026-01-01T00:00:00.000Z');
    const first = provider.signUploadUrl({
      contentType: 'application/pdf',
      expiresAt,
      key: 'org-1/file.pdf',
    });

    const second = provider.signUploadUrl({
      contentType: 'application/pdf',
      expiresAt,
      key: 'org-1/file.pdf',
    });

    expect(first.url).toEqual(second.url);
    expect(first.method).toBe('PUT');
    expect(first.headers).toEqual({ 'content-type': 'application/pdf' });
    expect(first.url).toContain('/storage/object/upload/org-1%2Ffile.pdf');
    expect(first.url).toContain('signature=');
  });
});
