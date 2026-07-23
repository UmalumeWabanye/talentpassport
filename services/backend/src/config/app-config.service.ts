import { Injectable } from '@nestjs/common';

import { getBackendEnv } from './environment';

@Injectable()
export class AppConfigService {
  private readonly env = getBackendEnv();

  get nodeEnv() {
    return this.env.NODE_ENV;
  }

  get port() {
    return this.env.PORT;
  }

  get logLevel() {
    return this.env.LOG_LEVEL;
  }

  get databaseUrl() {
    return this.env.DATABASE_URL;
  }

  get redisUrl() {
    return this.env.REDIS_URL;
  }
}