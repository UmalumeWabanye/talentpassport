import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    include: ['src/**/*.test.ts'],
    pool: 'forks',
    setupFiles: ['./vitest.setup.ts']
  }
});
