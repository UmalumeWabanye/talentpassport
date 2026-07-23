import { config } from 'dotenv';
import process from 'node:process';
import { URL } from 'node:url';

config({ path: new URL('../../.env', import.meta.url) });

export default {
  schema: 'schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL
  }
};