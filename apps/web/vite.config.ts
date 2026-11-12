import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@repo/shared/schemas/auth-validation.schema": fileURLToPath(
        new URL("../../packages/shared/src/schemas/auth-validation.schema.ts", import.meta.url),
      ),
      "@repo/shared/schemas/classroom.constants": fileURLToPath(
        new URL("../../packages/shared/src/schemas/classroom.constants.ts", import.meta.url),
      ),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  }
})
