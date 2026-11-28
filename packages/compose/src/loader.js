// What a page loads of Compose: its shortcut, and enough for a site's menu to list it. The tool itself, with React
// and Loupe's components inside, is fetched when it's first opened. Where it has something to show before that, its
// own button, changes kept from before a reload, or having been open, it's fetched once the page has loaded and is idle
import { OPEN, readShortcut, storeKey } from './shared.js'

const kept = () => {
  try {
    return Boolean(sessionStorage.getItem(OPEN) || sessionStorage.getItem(storeKey()))
  } catch {
    return false
  }
}

// After the page's own work. A page that draws itself in the browser has also done that by then, which changes kept
// from before a reload need, as they're only made again on the page they were made on
function whenIdle(run) {
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(run, { timeout: 2000 }) : setTimeout(run, 200))
  if (document.readyState === 'complete') idle()
  else addEventListener('load', idle, { once: true })
}

/**
 * Puts Compose on the page. `launcher` adds its own button, for a page with nothing else to open it from, and
 * `shortcut` is the keys that open and close it, or false for none
 */
export function mount({ launcher = true, shortcut = 'alt+g', onToggle } = {}) {
  if (window.parchmentCompose) return window.parchmentCompose
  const keys = readShortcut(shortcut)
  let tool = null
  let loading = null

  const load = () =>
    (loading ??= import('./client.js').then(({ start }) => {
      // The tool listens for the shortcut itself from here on
      removeEventListener('keydown', onKeyDown, true)
      tool = start({ launcher, shortcut, onToggle })
      return tool
    }))

  function onKeyDown(event) {
    if (!keys?.matches(event)) return
    event.preventDefault()
    void load().then(() => tool.toggle(true))
  }
  addEventListener('keydown', onKeyDown, true)

  const compose = {
    toggle(on) {
      if (tool) tool.toggle(on)
      else if (on !== false) void load().then(() => tool.toggle(true))
    },
    get active() {
      return tool?.active ?? false
    },
    changes: () => tool?.changes() ?? { count: 0, text: '' },
    commands: () => tool?.commands() ?? [{ id: 'compose', name: 'Compose this page', keys: keys?.shown, run: () => compose.toggle(true) }],
  }
  window.parchmentCompose = compose
  dispatchEvent(new CustomEvent('compose:change'))
  if (launcher || kept()) whenIdle(load)
  return compose
}
