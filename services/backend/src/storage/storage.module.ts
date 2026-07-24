import { Module } from '@nestjs/common';

import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageProviderFactory } from './providers/storage-provider.factory';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, StorageProviderFactory, LocalStorageProvider],
})
export class StorageModule {}
