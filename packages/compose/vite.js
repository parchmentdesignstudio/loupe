// Puts Compose on every page a Vite dev server serves. It's never in a build
import { fileURLToPath } from 'node:url'
import { middleware } from './server.js'

const client = fileURLToPath(new URL('./lib/compose.js', import.meta.url))

export function compose() {
  return {
    name: 'compose',
    apply: (_, { command }) => command === 'serve' && !process.env.VITEST,
    configureServer: (server) => void server.middlewares.use('/__compose', middleware(server.config.root)),
    transformIndexHtml: () => [
      { tag: 'script', attrs: { type: 'module' }, children: `import { mount } from ${JSON.stringify(`/@fs/${client.replace(/^\//, '')}`)}\nmount()`, injectTo: 'body' },
    ],
  }
}
