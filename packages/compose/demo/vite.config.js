// The demo runs Compose from its source, so a change shows without building
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { panelCss } from '../panel-css.js'
import { middleware } from '../server.js'

const source = {
  name: 'compose-source',
  configureServer: (server) => void server.middlewares.use('/__compose', middleware(server.config.root)),
  transformIndexHtml: () => [{ tag: 'script', attrs: { type: 'module' }, children: `import { mount } from '/@fs/${import.meta.dirname.replace(/^\//, '')}/../src/client.js'\nmount()`, injectTo: 'body' }],
}

export default defineConfig({ plugins: [react(), panelCss(), source], server: { port: 5191, fs: { allow: ['../../..'] } } })
