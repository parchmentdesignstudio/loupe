// Compiles src/panel.css with Tailwind and hands it over as a string, for Compose to put in its shadow root.
// Tailwind's own Vite plugin would put it on the page, where its reset would restyle the site being worked on
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { compile, optimize } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'

const name = 'virtual:compose-panel-styles'
const base = fileURLToPath(new URL('./src', import.meta.url))
const from = `${base}/panel.css`

export function panelCss() {
  return {
    name: 'compose-panel-css',
    resolveId: (source) => (source === name ? `\0${name}` : undefined),
    async load(id) {
      if (id !== `\0${name}`) return
      const compiler = await compile(await readFile(from, 'utf8'), { base, from, onDependency: (file) => this.addWatchFile(file) })
      const root = compiler.root === 'none' ? [] : compiler.root === null ? [{ base, pattern: '**/*', negated: false }] : [{ ...compiler.root, negated: false }]
      const scanner = new Scanner({ sources: [...root, ...compiler.sources] })
      const { code } = optimize(compiler.build(scanner.scan()), { minify: true })
      return `export default ${JSON.stringify(code)}`
    },
  }
}
