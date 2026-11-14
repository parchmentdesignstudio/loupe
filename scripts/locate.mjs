// Option-click an element in a dev server to open where it’s used, in Nova. Option-Shift-click opens where the
// component draws it instead. Holding Option outlines it and names both. Dragging with Option still drags
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'

const runtime = '\0locate:jsx-dev-runtime'

export function locate() {
  let root = ''
  const placeOf = (text) => {
    const [, path, line, column] = /^(.+):(\d+):(\d+)$/.exec(text) ?? []
    const file = path && resolve(root, path)
    if (file?.startsWith(root + sep) && statSync(file, { throwIfNoEntry: false })?.isFile()) return { file, line, column }
  }
  return {
    name: 'locate',
    enforce: 'pre',
    apply: (_, { command }) => command === 'serve' && !process.env.VITEST,
    configResolved(config) {
      root = config.root
      while (!existsSync(join(root, 'pnpm-workspace.yaml')) && dirname(root) !== root) root = dirname(root)
      if (!existsSync(join(root, 'pnpm-workspace.yaml'))) root = config.root
    },
    // The dev JSX runtime knows where each element was written, so a wrapper hands that on as data-source
    resolveId(source, importer) {
      if (source === 'react/jsx-dev-runtime' && importer && importer !== runtime && !importer.includes('/node_modules/')) return runtime
    },
    load(id) {
      if (id !== runtime) return
      return `import { jsxDEV as create, Fragment } from 'react/jsx-dev-runtime'
export { Fragment }
const root = ${JSON.stringify(root + sep)}
export function jsxDEV(type, props, key, isStatic, source, self) {
  if (source && typeof type !== 'symbol') {
    const file = source.fileName.startsWith(root) ? source.fileName.slice(root.length) : source.fileName
    props = { ...props, 'data-source': file + ':' + source.lineNumber + ':' + source.columnNumber }
  }
  return create(type, props, key, isStatic, source, self)
}`
    },
    transformIndexHtml: () => [{ tag: 'script', attrs: { type: 'module' }, children: `(${client})()`, injectTo: 'head' }],
    configureServer(server) {
      server.middlewares.use('/__locate', (request, response) => {
        if (request.headers['sec-fetch-site'] !== 'same-origin' || !['GET', 'POST'].includes(request.method)) {
          response.statusCode = 403
          return response.end()
        }
        // The name the code gives the element written there, as a library component’s own can be an internal one
        if (request.method === 'GET') {
          const place = placeOf(new URL(request.url, 'http://localhost').searchParams.get('at') ?? '')
          const text = place && readFileSync(place.file, 'utf8').split('\n')[place.line - 1]?.slice(place.column - 1)
          const name = text && /^<([\w$.:-]+)/.exec(text)?.[1]
          response.statusCode = name ? 200 : 204
          return response.end(name || '')
        }
        let body = ''
        request.on('data', (chunk) => (body += chunk))
        request.on('end', () => {
          const place = placeOf(body)
          if (!place) {
            response.statusCode = 404
            return response.end()
          }
          const { file, line, column } = place
          // A server started from the Dock may not have /usr/local/bin on its PATH, so try Nova’s own copy next
          const nova = ['open', file, '--line', `${line}:${column}`, '--no-wait']
          execFile('nova', nova, (error) =>
            error && execFile('/Applications/Nova.app/Contents/SharedSupport/nova', nova, (failed) => failed && execFile('open', [file])),
          )
          response.statusCode = 204
          response.end()
        })
      })
    },
  }
}

// Runs in the page, so it can only use what’s inside it
function client() {
  const colour = 'oklch(0.55 0.2 255)'
  const box = document.createElement('div')
  const label = document.createElement('div')
  box.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;box-sizing:border-box;border:1.5px solid ${colour};border-radius:3px;display:none`
  label.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;padding:2px 6px;border-radius:4px;background:${colour};color:white;font:500 11px/16px ui-monospace,Menlo,monospace;white-space:nowrap;display:none`
  let held = false
  let point = null
  let press = null
  let swallow = false

  let fiberKey
  const fiberOf = (node) => {
    for (; node; node = node.parentNode) {
      fiberKey ??= Object.keys(node).find((name) => name.startsWith('__reactFiber$'))
      if (node[fiberKey]) return node[fiberKey]
    }
  }
  // An element and the components above it that draw it, up to the element around it. Not every component passes
  // data-source on, so each one’s place comes from React’s tree
  const inspect = (node) => {
    let fiber = fiberOf(node)
    let element, drawn, outer
    const fibers = new Map()
    while (fiber) {
      const host = fiber.stateNode
      do {
        const at = fiber.memoizedProps?.['data-source']
        if (at) {
          drawn ??= at
          outer = at
          // A place handed down sits on each fiber below the element written there, so the outermost is that element
          fibers.set(at, fiber)
        }
        fiber = fiber.return
      } while (fiber && typeof fiber.type !== 'string')
      if (!drawn) continue
      element ??= host
      // An element around it from the same place, such as a library component’s wrapper, belongs with it
      if (fiber?.memoizedProps?.['data-source'] !== outer) break
    }
    if (!(element instanceof Element)) return
    // Written by a component that draws nothing else, it’s used where that component is
    const { _debugOwner: owner } = fibers.get(drawn)
    const place = owner?.memoizedProps?.['data-source']
    return { element, used: fibers.has(place) ? place : drawn, drawn }
  }

  const names = new Map()
  const describe = (at) => {
    if (!names.has(at)) {
      names.set(at, '')
      fetch(`/__locate?at=${encodeURIComponent(at)}`)
        .then((response) => (response.ok ? response.text() : ''))
        .then((name) => name && (names.set(at, name), paint()))
        .catch(() => {})
    }
    const name = names.get(at)
    return (name ? `<${name}> ` : '') + at.slice(at.lastIndexOf('/') + 1, at.lastIndexOf(':'))
  }

  const paint = () => {
    const found = held && point && !press ? inspect(document.elementFromPoint(point.x, point.y)) : null
    box.style.display = label.style.display = found ? 'block' : 'none'
    if (!found) return
    if (!box.isConnected) document.documentElement.append(box, label)
    const { element, used, drawn } = found
    const { left, top, bottom, width, height } = element.getBoundingClientRect()
    Object.assign(box.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` })
    label.textContent = describe(used) + (used === drawn ? '' : `   ⇧ ${describe(drawn)}`)
    Object.assign(label.style, { left: `${Math.max(4, left)}px`, top: `${top > 24 ? top - 22 : bottom + 4}px` })
  }

  const hold = (event, down) => {
    if (event.key !== 'Alt') return
    held = down
    paint()
  }
  addEventListener('keydown', (event) => hold(event, true), true)
  addEventListener('keyup', (event) => hold(event, false), true)
  addEventListener('blur', () => {
    held = false
    paint()
  })
  addEventListener('scroll', paint, true)
  addEventListener(
    'pointermove',
    (event) => {
      held = event.altKey
      point = { x: event.clientX, y: event.clientY }
      paint()
    },
    true,
  )
  addEventListener(
    'pointerdown',
    (event) => {
      swallow = false
      const found = event.altKey && event.button === 0 ? inspect(event.target) : null
      press = found && { ...found, x: event.clientX, y: event.clientY, pointer: event.pointerId }
      paint()
    },
    true,
  )
  addEventListener(
    'pointerup',
    (event) => {
      const start = press
      press = null
      // From 3px it’s a drag, as on device’s canvas, where Option-dragging duplicates
      const still = start && event.altKey && start.pointer === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 3
      if (!still) return paint()
      // The page saw the press begin, so end it as a cancelled one: buttons don’t fire and nothing gets dragged
      event.stopImmediatePropagation()
      event.target.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: event.pointerId, pointerType: event.pointerType, isPrimary: event.isPrimary }))
      swallow = true
      fetch('/__locate', { method: 'POST', body: event.shiftKey ? start.drawn : start.used }).catch(() => {})
      paint()
    },
    true,
  )
  addEventListener(
    'click',
    (event) => {
      if (!swallow) return
      swallow = false
      event.preventDefault()
      event.stopImmediatePropagation()
    },
    true,
  )
}
