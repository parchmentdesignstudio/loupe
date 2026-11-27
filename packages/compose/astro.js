// Adds Compose to Astro's dev toolbar, which opens and closes it
import { middleware } from './server.js'

export default function compose() {
  return {
    name: '@parchment/compose',
    hooks: {
      // The list of changes is kept in a file in the site, for an agent to read
      'astro:server:setup': ({ server }) => void server.middlewares.use('/__compose', middleware(server.config.root)),
      'astro:config:setup': ({ command, addDevToolbarApp, injectScript }) => {
        if (command !== 'dev') return
        injectScript('head-inline', `(${keepSources})()`)
        addDevToolbarApp({
          id: 'parchment-compose',
          name: 'Compose',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 2.5h11v11h-11zM6.5 2.5v11M6.5 8h7"/></svg>',
          entrypoint: new URL('./astro-app.js', import.meta.url),
        })
      },
    },
  }
}

// Astro writes where each element came from on the element, and its toolbar takes that off again once it has read
// it. This keeps what was there, for the handover to say where a change belongs. It runs in the page
function keepSources() {
  const kept = (window.parchmentComposeSources = new WeakMap())
  new MutationObserver((records) => {
    for (const { target, attributeName, oldValue } of records) {
      if (oldValue && !target.hasAttribute(attributeName)) kept.set(target, { ...kept.get(target), [attributeName]: oldValue })
    }
  }).observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-astro-source-file', 'data-astro-source-loc'] })
}
