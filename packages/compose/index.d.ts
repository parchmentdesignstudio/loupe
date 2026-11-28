export interface ComposeCommand {
  id: string
  /** What it does, as a menu would list it, such as Compose this page */
  name: string
  /** Its shortcut, if it has one, such as ⌥G */
  keys?: string
  run(): void
}

export interface Compose {
  /** Opens or closes Compose, or switches it when called with nothing */
  toggle(on?: boolean): void
  readonly active: boolean
  /** The changes so far: how many, and the text Copy changes gives */
  changes(): { count: number; text: string }
  /** What Compose can be asked to do just now, for a site's own menu of commands. A compose:change event on the window says when to ask again */
  commands(): ComposeCommand[]
}

export interface ComposeOptions {
  /** Compose's own button, at the foot of the page. On unless the site opens Compose another way */
  launcher?: boolean
  /** The keys that open and close it, such as 'alt+g' or 'cmd+shift+l', or false for none */
  shortcut?: string | false
}

/** Puts Compose on the page: its shortcut straight away, and the tool itself when it’s first opened */
export function mount(options?: ComposeOptions & { onToggle?: (on: boolean) => void }): Compose

/** Vite plugin: Compose on every page of the dev server */
export function compose(options?: ComposeOptions): { name: string }

/** Astro integration: Compose in the dev toolbar */
export default function astro(options?: Pick<ComposeOptions, 'shortcut'>): { name: string; hooks: Record<string, unknown> }

declare global {
  interface Window {
    /** There while Compose is on the page, which is only in development */
    parchmentCompose?: Compose
  }
}
