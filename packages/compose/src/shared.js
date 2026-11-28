// What the loader and the tool both need: the shortcut, and which page changes are kept for

export const isMac = /Mac|iPhone|iPad/.test(navigator.platform)

/** A shortcut as it's written, such as alt+g or cmd+shift+l, and as a menu shows it */
export function readShortcut(text) {
  const parts = text ? text.toLowerCase().split('+') : []
  const key = parts.pop()
  if (!key) return null
  const has = (...names) => names.some((name) => parts.includes(name))
  const keys = { alt: has('alt', 'option'), command: has('cmd', 'command', 'meta', 'ctrl'), shift: has('shift'), code: /^[a-z]$/.test(key) ? `Key${key.toUpperCase()}` : /^\d$/.test(key) ? `Digit${key}` : key }
  keys.shown = `${keys.alt ? '⌥' : ''}${keys.shift ? '⇧' : ''}${keys.command ? (isMac ? '⌘' : 'Ctrl ') : ''}${key.toUpperCase()}`
  keys.matches = (event) => event.altKey === keys.alt && (event.metaKey || event.ctrlKey) === keys.command && event.shiftKey === keys.shift && (event.code === keys.code || event.key.toLowerCase() === key)
  return keys
}

/** The page changes belong to: its path, and its hash where that's a route, as #/ui/button is, rather than a place on the page */
export const page = () => location.pathname + (location.hash.startsWith('#/') ? location.hash : '')

/** Where a page's changes are kept through a reload */
export const storeKey = () => `compose:${page()}`

/** Kept while Compose is open, so a reload opens it again */
export const OPEN = 'compose:on'
