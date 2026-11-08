import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The preview page, for seeing every component while working on them.
export default defineConfig({
  root: 'preview-src',
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../preview-dist', emptyOutDir: true },
})
