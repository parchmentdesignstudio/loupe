// Puts Compose on every page a Vite dev server serves. It's never in a build
import { fileURLToPath } from 'node:url'

const client = fileURLToPath(new URL('./src/client.js', import.meta.url))

export function compose() {
  return {
    name: 'compose',
    apply: (_, { command }) => command === 'serve' && !process.env.VITEST,
    transformIndexHtml: () => [
      { tag: 'script', attrs: { type: 'module' }, children: `import { mount } from ${JSON.stringify(`/@fs/${client.replace(/^\//, '')}`)}\nmount()`, injectTo: 'body' },
    ],
  }
}
