// Puts Compose on every page a Vite dev server serves. It's never in a build
import { middleware } from './server.js'

/** `launcher: false` leaves out Compose's own button, for a site that opens it by its shortcut or from its own menu. `shortcut` changes the keys from alt+g, or is false for none */
export function compose({ launcher = true, shortcut = 'alt+g' } = {}) {
  return {
    name: 'compose',
    apply: (_, { command }) => command === 'serve' && !process.env.VITEST,
    configureServer: (server) => void server.middlewares.use('/__compose', middleware(server.config.root)),
    // Only the loader, a couple of kilobytes, from Compose's own middleware. It fetches the tool when it's first opened
    transformIndexHtml: () => [
      { tag: 'script', attrs: { type: 'module' }, children: `import { mount } from '/__compose/compose.js'\nmount(${JSON.stringify({ launcher, shortcut })})`, injectTo: 'body' },
    ],
  }
}
