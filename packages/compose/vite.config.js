// Builds Compose into two files: the loader, which is all a page fetches until Compose is opened, and the tool, with
// React, Loupe's components and their styles inside it, so a site that has none of them can still run it
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { panelCss } from './panel-css.js'

export default defineConfig({
  plugins: [react(), panelCss()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'lib',
    lib: { entry: 'src/loader.js', formats: ['es'], fileName: 'compose' },
    // The tool's file keeps one name between builds, as lib is committed
    rollupOptions: { output: { chunkFileNames: 'compose-[name].js' } },
  },
})
