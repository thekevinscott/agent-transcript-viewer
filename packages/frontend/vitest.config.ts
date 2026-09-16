import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Lives at the package root (not under src/) so the testing-conventions
// location check — which scans src/ — never treats it as an untested source
// file. Unit tests are colocated with their subject as `*.test.ts(x)`.
//
// Every glob is cwd-agnostic on purpose: the coverage gate runs vitest from
// the scan root (packages/frontend/src) while `pnpm test` and the mutation gate
// run from the package root, and a `src/`-anchored glob matches in only one
// of the two.
//
// `tests/` is excluded: it is the Playwright integration tier, which has its
// own runner.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
    coverage: {
      provider: 'v8',
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/main.tsx'],
    },
  },
});
