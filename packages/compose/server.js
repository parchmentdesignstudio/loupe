// The dev server's side of Compose: it keeps the list of changes in a file, for an agent to read without anything
// being copied. Used by the Vite plugin and the Astro integration
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const changesFile = '.compose/changes.md'

/** Connect middleware for /__compose: GET says it's here and where it writes, POST writes the changes, or clears them when there are none */
export function middleware(root) {
  return (request, response) => {
    if (request.headers['sec-fetch-site'] !== 'same-origin' || !['GET', 'POST'].includes(request.method)) {
      response.statusCode = 403
      return response.end()
    }
    if (request.method === 'GET') return response.end(changesFile)
    let body = ''
    request.on('data', (chunk) => (body += chunk))
    request.on('end', () => {
      const file = join(root, changesFile)
      if (body.trim()) {
        mkdirSync(join(root, '.compose'), { recursive: true })
        writeFileSync(file, `${body.trim()}\n`)
      } else rmSync(file, { force: true })
      response.statusCode = 204
      response.end()
    })
  }
}
