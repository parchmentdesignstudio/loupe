import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { locate } from '../../scripts/locate.mjs'
import { compose } from '../../packages/compose/vite.js'

export default defineConfig({
  plugins: [locate(), compose({ launcher: false }), react(), tailwindcss()],
  server: { port: 5190 },
})
