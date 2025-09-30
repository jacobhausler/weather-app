import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [path.resolve(__dirname, './src/setupTests.ts')],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
    },
    testTimeout: 10000,
    exclude: ['node_modules/**', 'dist/**'],
  },
});
