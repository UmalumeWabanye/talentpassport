import { Inject, Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';

import { LocalStorageProvider } from './local-storage.provider';
import type { StorageProvider } from './storage-provider.interface';
import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class StorageProviderFactory {
  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
    @Inject(LocalStorageProvider) private readonly localProvider: LocalStorageProvider,
  ) {}

  getProvider(): StorageProvider {
    if (this.configService.storageProvider === 'local') {
      return this.localProvider;
    }

    throw new InternalServerErrorException(
      `Unsupported storage provider: ${this.configService.storageProvider}`,
    );
  }
}
