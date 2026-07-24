import { Module } from '@nestjs/common';

import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageProviderFactory } from './providers/storage-provider.factory';
import { FileValidationService } from './security/file-validation.service';
import { NoopMalwareScannerService } from './security/noop-malware-scanner.service';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [
    StorageService,
    StorageProviderFactory,
    LocalStorageProvider,
    FileValidationService,
    NoopMalwareScannerService,
  ],
})
export class StorageModule {}
