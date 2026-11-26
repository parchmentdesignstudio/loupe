import { defineToolbarApp } from 'astro/toolbar'
import { mount } from './src/client.js'

export default defineToolbarApp({
  init(_canvas, app) {
    // Closing Compose from its own panel turns its button in the toolbar off as well
    const compose = mount({ launcher: false, onToggle: (on) => app.toggleState({ state: on }) })
    app.onToggled(({ state }) => compose.toggle(state))
  },
})
