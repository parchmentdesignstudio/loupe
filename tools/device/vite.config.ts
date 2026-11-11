import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { locate } from '../../scripts/locate.mjs'

export default defineConfig({
  plugins: [locate(), react(), tailwindcss()],
  server: { port: 5190 },
})
