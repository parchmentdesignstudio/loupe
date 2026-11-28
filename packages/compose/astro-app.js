import { defineToolbarApp } from 'astro/toolbar'
import { mount } from './lib/compose.js'

export default defineToolbarApp({
  init(_canvas, app) {
    // Closing Compose from its own panel turns its button in the toolbar off as well
    const compose = mount({ ...window.parchmentComposeOptions, launcher: false, onToggle: (on) => app.toggleState({ state: on }) })
    app.onToggled(({ state }) => compose.toggle(state))
  },
})
