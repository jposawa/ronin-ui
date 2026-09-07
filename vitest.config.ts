import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Kept separate from `vite.config.ts`: that one is the library build, in lib mode with React
 * externalised, which is the wrong shape for running tests.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    /**
     * These tests assert behaviour and accessibility, never appearance — jsdom computes no
     * layout, so a style assertion here would be theatre. Off also silences jsdom's
     * "Could not parse CSS stylesheet" on the cascade layers and nesting it does not support.
     */
    css: false,
  },
})
