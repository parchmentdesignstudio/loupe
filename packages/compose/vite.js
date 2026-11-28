// Puts Compose on every page a Vite dev server serves. It's never in a build
import { fileURLToPath } from 'node:url'
import { middleware } from './server.js'

const client = fileURLToPath(new URL('./lib/compose.js', import.meta.url))

/** `launcher: false` leaves out Compose's own button, for a site that opens it by its shortcut or from its own menu. `shortcut` changes the keys from alt+g, or is false for none */
export function compose({ launcher = true, shortcut = 'alt+g' } = {}) {
  return {
    name: 'compose',
    apply: (_, { command }) => command === 'serve' && !process.env.VITEST,
    configureServer: (server) => void server.middlewares.use('/__compose', middleware(server.config.root)),
    transformIndexHtml: () => [
      { tag: 'script', attrs: { type: 'module' }, children: `import { mount } from ${JSON.stringify(`/@fs/${client.replace(/^\//, '')}`)}\nmount(${JSON.stringify({ launcher, shortcut })})`, injectTo: 'body' },
    ],
  }
}
