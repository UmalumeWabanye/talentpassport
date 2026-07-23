import { parseEnv } from '@talent-passport/config';
import type { AppEnv } from '@talent-passport/config';

export function getBackendEnv(input: Record<string, string | undefined> = process.env): AppEnv {
  return parseEnv(input);
}
