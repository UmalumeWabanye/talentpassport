import { describe, expect, it } from 'vitest';

import { FileValidationService } from './file-validation.service';
import type { AppConfigService } from '../../config/app-config.service';

function createConfig(overrides?: Partial<AppConfigService>) {
  return {
    storageAllowedMimeTypes: new Set(['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'text/csv']),
    storageMaxFileSizeBytes: 10 * 1024 * 1024,
    ...overrides,
  } as AppConfigService;
}

describe('FileValidationService', () => {
  it('accepts valid mime, extension, and file size', () => {
    const service = new FileValidationService(createConfig());

    const result = service.validateUpload({
      mimeType: 'application/pdf',
      originalName: 'candidate-portfolio.pdf',
      sizeBytes: 120_000,
    });

    expect(result.extension).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.originalName).toBe('candidate-portfolio.pdf');
  });

  it('sanitizes potentially unsafe original names', () => {
    const service = new FileValidationService(createConfig());

    const result = service.validateUpload({
      mimeType: 'image/png',
      originalName: '../../Profile Photo (Final).png',
      sizeBytes: 50_000,
    });

    expect(result.originalName).toBe('Profile-Photo-Final-.png');
  });

  it('rejects disallowed MIME types', () => {
    const service = new FileValidationService(createConfig());

    expect(() =>
      service.validateUpload({
        mimeType: 'application/x-msdownload',
        originalName: 'installer.exe',
        sizeBytes: 1024,
      }),
    ).toThrow('File MIME type is not allowed');
  });

  it('rejects mismatched extension and MIME type', () => {
    const service = new FileValidationService(createConfig());

    expect(() =>
      service.validateUpload({
        mimeType: 'application/pdf',
        originalName: 'avatar.png',
        sizeBytes: 1024,
      }),
    ).toThrow('File extension does not match declared MIME type');
  });

  it('rejects files that exceed max allowed size', () => {
    const service = new FileValidationService(
      createConfig({
        storageMaxFileSizeBytes: 1024,
      }),
    );

    expect(() =>
      service.validateUpload({
        mimeType: 'text/plain',
        originalName: 'notes.txt',
        sizeBytes: 4096,
      }),
    ).toThrow('File exceeds maximum allowed size');
  });
});
