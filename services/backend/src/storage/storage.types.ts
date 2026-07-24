export type SignedUrlRequest = {
  contentType?: string;
  expiresAt: Date;
  key: string;
};

export type SignedUrlResult = {
  expiresAt: string;
  headers?: Record<string, string>;
  method: 'GET' | 'PUT';
  provider: string;
  url: string;
};

export type StorageFileMetadataRecord = {
  checksum: string | null;
  createdAt: string;
  id: string;
  mimeType: string;
  organizationId: string;
  originalName: string;
  sizeBytes: number;
  storageKey: string;
  updatedAt: string;
  uploadedById: string | null;
};
