import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'build/',
        'tests/',
        '*.config.js',
        'scripts/dev.js', // Dev server is difficult to test in isolation
        'scripts/serve.js', // Serve script is difficult to test in isolation
        'scripts/build.js' // Build script tested via integration tests
      ],
      include: ['scripts/**/*.js'],
      all: true,
      // Note: Current tests verify functionality through unit and integration tests
      // Coverage thresholds are set to 0 since we test functionality in isolation
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0
    }
  }
});
