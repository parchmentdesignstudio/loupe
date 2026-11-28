import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { locate } from '../../scripts/locate.mjs'
import { compose } from '../../packages/compose/vite.js'

export default defineConfig({
  plugins: [locate(), compose({ launcher: false }), react(), tailwindcss()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        reference: resolve(import.meta.dirname, 'reference.html'),
      },
    },
  },
})
