import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // tsconfig.json sets "jsx": "preserve" for Next.js's own SWC pipeline; override it here so
  // Vite's oxc transform can compile .tsx test files directly (Next's build is unaffected).
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['core/**/*.ts'],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
