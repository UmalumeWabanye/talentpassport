import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './bootstrap/configure-app';
import { getBackendEnv } from './config/environment';

async function bootstrap() {
  const env = getBackendEnv();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  configureApp(app);

  await app.listen(env.PORT);
  Logger.log(`Backend service listening on port ${env.PORT}`, 'Bootstrap');
}

void bootstrap();
