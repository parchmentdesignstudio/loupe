export interface Compose {
  /** Opens or closes Compose, or switches it when called with nothing */
  toggle(on?: boolean): void
  readonly active: boolean
  /** The changes so far: how many, and the text Copy changes gives */
  changes(): { count: number; text: string }
}

/** Puts Compose on the page. `launcher` adds its own button, for a page with no toolbar to open it from */
export function mount(options?: { launcher?: boolean; onToggle?: (on: boolean) => void }): Compose

/** Vite plugin: Compose on every page of the dev server */
export function compose(): { name: string }

/** Astro integration: Compose in the dev toolbar */
export default function astro(): { name: string; hooks: Record<string, unknown> }
