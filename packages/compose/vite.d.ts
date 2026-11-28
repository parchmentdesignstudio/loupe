export interface ComposeOptions {
  /** Compose's own button, at the foot of the page. On unless the site opens Compose another way */
  launcher?: boolean
  /** The keys that open and close it, such as 'alt+g' or 'cmd+shift+l', or false for none */
  shortcut?: string | false
}

/** Vite plugin: Compose on every page of the dev server */
export function compose(options?: ComposeOptions): { name: string }
