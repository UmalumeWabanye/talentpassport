import { Inject, Injectable } from '@nestjs/common';
import { createHmac } from 'node:crypto';

import { AppConfigService } from '../../config/app-config.service';
import type { SignedUrlRequest, SignedUrlResult } from '../storage.types';
import type { StorageProvider } from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly providerName = 'local';

  constructor(@Inject(AppConfigService) private readonly configService: AppConfigService) {}

  signUploadUrl(request: SignedUrlRequest): SignedUrlResult {
    return this.signUrl('PUT', 'upload', request);
  }

  signDownloadUrl(request: SignedUrlRequest): SignedUrlResult {
    return this.signUrl('GET', 'download', request);
  }

  private signUrl(method: 'GET' | 'PUT', action: 'download' | 'upload', request: SignedUrlRequest): SignedUrlResult {
    const expiresEpoch = Math.floor(request.expiresAt.getTime() / 1000).toString();
    const signature = this.signToken(method, request.key, expiresEpoch);
    const baseUrl = this.configService.storagePublicBaseUrl.replace(/\/+$/, '');
    const encodedKey = encodeURIComponent(request.key);
    const url = `${baseUrl}/storage/object/${action}/${encodedKey}?expires=${expiresEpoch}&signature=${signature}`;

    const headers = method === 'PUT' && request.contentType
      ? { 'content-type': request.contentType }
      : undefined;

    return {
      expiresAt: request.expiresAt.toISOString(),
      headers,
      method,
      provider: this.providerName,
      url
    };
  }

  private signToken(method: 'GET' | 'PUT', key: string, expiresEpoch: string) {
    const payload = `${method}:${key}:${expiresEpoch}`;

    return createHmac('sha256', this.configService.storageSigningSecret)
      .update(payload)
      .digest('hex');
  }
}
