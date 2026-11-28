import { readFile } from 'node:fs/promises'
import { compile, optimize } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const base = import.meta.dirname
const css = {
  name: 'proto-css',
  resolveId: (source) => (source === 'virtual:proto-styles' ? '\0virtual:proto-styles' : undefined),
  async load(id) {
    if (id !== '\0virtual:proto-styles') return
    const from = `${base}/proto.css`
    const compiler = await compile(await readFile(from, 'utf8'), { base, from, onDependency: () => {} })
    const scanner = new Scanner({ sources: [{ base, pattern: '**/*', negated: false }, ...compiler.sources] })
    return `export default ${JSON.stringify(optimize(compiler.build(scanner.scan()), { minify: true }).code)}`
  },
}

export default defineConfig({
  plugins: [react(), css],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: { outDir: process.env.OUT, emptyOutDir: false, lib: { entry: `${base}/variations.jsx`, formats: ['es'], fileName: 'variations' } },
})
