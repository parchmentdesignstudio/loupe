import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { locate } from '../../scripts/locate.mjs'

export default defineConfig({
  plugins: [locate(), react(), tailwindcss()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        reference: resolve(import.meta.dirname, 'reference.html'),
      },
    },
  },
})
