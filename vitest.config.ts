import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // fake secrets so tests never touch your real .env
    env: { JWT_SECRET: 'test-secret', ADMIN_PASSWORD: 'test-password' },
  },
});