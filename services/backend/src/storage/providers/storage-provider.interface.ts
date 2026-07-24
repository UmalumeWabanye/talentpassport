import type { SignedUrlRequest, SignedUrlResult } from '../storage.types';

export interface StorageProvider {
  readonly providerName: string;

  signDownloadUrl(request: SignedUrlRequest): SignedUrlResult;
  signUploadUrl(request: SignedUrlRequest): SignedUrlResult;
}
