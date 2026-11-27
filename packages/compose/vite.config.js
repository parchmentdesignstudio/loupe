// Builds Compose into one file, with React, Loupe's components and their styles inside it, so a site that has
// none of them can still run it
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { panelCss } from './panel-css.js'

export default defineConfig({
  plugins: [react(), panelCss()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'lib',
    lib: { entry: 'src/client.js', formats: ['es'], fileName: 'compose' },
  },
})
