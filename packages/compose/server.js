// The dev server's side of Compose. It serves Compose's own files, as they're built, so the dev server neither
// transforms them nor writes a source map for them, and it keeps the list of changes in a file, for an agent to read
// without anything being copied. Used by the Vite plugin and the Astro integration
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const changesFile = '.compose/changes.md'

const lib = fileURLToPath(new URL('./lib', import.meta.url))

// One of Compose's built files, by its name alone, so nothing outside lib can be asked for
function file(request, response) {
  const name = (request.url ?? '').split('?')[0].slice(1)
  const path = /^[\w-]+\.js$/.test(name) ? join(lib, name) : ''
  if (request.method !== 'GET' || !path || !existsSync(path)) return false
  const { size, mtimeMs } = statSync(path)
  const tag = `"${size}-${Math.round(mtimeMs)}"`
  response.setHeader('etag', tag)
  // Asked about each time, and only sent again once it's been rebuilt
  response.setHeader('cache-control', 'no-cache')
  if (request.headers['if-none-match'] === tag) {
    response.statusCode = 304
    response.end()
  } else {
    response.setHeader('content-type', 'text/javascript')
    createReadStream(path).pipe(response)
  }
  return true
}

/**
 * Connect middleware for /__compose: GET of a file's name sends that file of Compose's, GET alone says it's here and
 * where it writes, and POST writes the changes, or clears them when there are none
 */
export function middleware(root) {
  return (request, response) => {
    const site = request.headers['sec-fetch-site']
    // A browser too old to say where a request is from can still load Compose, but not write
    if ((!site || site === 'same-origin') && file(request, response)) return
    if (site !== 'same-origin' || !['GET', 'POST'].includes(request.method)) {
      response.statusCode = 403
      return response.end()
    }
    if (request.method === 'GET') return response.end(changesFile)
    let body = ''
    request.on('data', (chunk) => (body += chunk))
    request.on('end', () => {
      const path = join(root, changesFile)
      if (body.trim()) {
        mkdirSync(join(root, '.compose'), { recursive: true })
        writeFileSync(path, `${body.trim()}\n`)
      } else rmSync(path, { force: true })
      response.statusCode = 204
      response.end()
    })
  }
}
