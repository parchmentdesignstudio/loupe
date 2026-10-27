import { useSyncExternalStore } from 'react'
import { byPosition, createDevice, defaultArtboard, defaultDoc, defaultSettings, flow, type Device, type Doc, type Settings } from './document'
import type { Rect } from './geometry'
import type { SnapGap, SnapLine } from './snapping'

export type Tool = 'select' | 'hand'

export interface Viewport {
  /** Where the artboard’s top left is on screen */
  x: number
  y: number
  zoom: number
}

export interface State {
  doc: Doc
  settings: Settings
  selection: string[]
  tool: Tool
  /** Space is held, to pan */
  spaceHeld: boolean
  viewport: Viewport
  /** The canvas’s size on screen */
  view: { width: number; height: number }
  hovered: string | null
  /** A device a file is being dragged over */
  dropTarget: string | null
  snaps: { lines: SnapLine[]; gaps: SnapGap[] } | null
  marquee: Rect | null
  /** A guide being dragged, to label */
  activeGuide: string | null
  /** A drag is under way, so hover holds off */
  busy: boolean
  past: Doc[]
  future: Doc[]
}

const DOC_KEY = 'device:document'
const SETTINGS_KEY = 'device:settings'
const HISTORY = 200

function read(key: string): unknown {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// What earlier versions saved that this one has no more: names, and hiding
// and locking from the layers panel, so nothing hidden stays out of reach
type Saved = Device & { name?: unknown; hidden?: unknown; locked?: unknown }

function loadDoc(): Doc {
  const stored = read(DOC_KEY) as Doc | null
  if (stored?.version !== 1 || !Array.isArray(stored.devices) || !stored.artboard) return defaultDoc()
  const artboard = { ...defaultArtboard, ...stored.artboard }
  const devices = (stored.devices as Saved[]).map(({ name, hidden, locked, ...device }) => createDevice(device.model, device))
  return flow({ ...stored, artboard, guides: stored.guides ?? [], devices: artboard.layout === 'row' ? byPosition(devices) : devices })
}

function loadSettings(): Settings {
  const stored = (read(SETTINGS_KEY) ?? {}) as Partial<Settings> & { panels?: { right?: boolean } }
  const { panels, ...rest } = stored
  return {
    ...defaultSettings,
    ...rest,
    grid: { ...defaultSettings.grid, ...stored.grid },
    columns: { ...defaultSettings.columns, ...stored.columns },
    inspector: stored.inspector ?? panels?.right ?? defaultSettings.inspector,
  }
}

let state: State = {
  doc: loadDoc(),
  settings: loadSettings(),
  selection: [],
  tool: 'select',
  spaceHeld: false,
  viewport: { x: 0, y: 0, zoom: 0.5 },
  view: { width: 0, height: 0 },
  hovered: null,
  dropTarget: null,
  snaps: null,
  marquee: null,
  activeGuide: null,
  busy: false,
  past: [],
  future: [],
}

const listeners = new Set<() => void>()

export function get(): State {
  return state
}

export function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function useStore<T>(selector: (state: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

/** Drops anything selected that’s no longer there, such as after an undo */
function kept(doc: Doc, selection: string[]) {
  return selection.filter((id) => doc.devices.some((device) => device.id === id))
}

/** Changes the document as one step to undo, laying out the row afresh */
export function change(recipe: (doc: Doc) => Doc) {
  const before = state.doc
  const after = flow(recipe(before))
  if (after === before) return
  set({ doc: after, past: [...state.past, before].slice(-HISTORY), future: [], selection: kept(after, state.selection) })
}

// A drag changes the document many times over, from where it started, and
// is one step to undo once it ends. It lays out the row itself, as what’s
// being dragged follows the pointer rather than its place
let gestureStart: Doc | null = null

export function beginGesture() {
  gestureStart = state.doc
}

export function previewGesture(recipe: (doc: Doc) => Doc) {
  if (gestureStart) set({ doc: recipe(gestureStart) })
}

export function endGesture() {
  if (gestureStart && state.doc !== gestureStart) set({ past: [...state.past, gestureStart].slice(-HISTORY), future: [] })
  gestureStart = null
}

export function cancelGesture() {
  if (gestureStart) set({ doc: gestureStart, selection: kept(gestureStart, state.selection) })
  gestureStart = null
}

export function undo() {
  const previous = state.past.at(-1)
  if (!previous) return
  set({ doc: previous, past: state.past.slice(0, -1), future: [state.doc, ...state.future], selection: kept(previous, state.selection) })
}

export function redo() {
  const [next, ...future] = state.future
  if (!next) return
  set({ doc: next, past: [...state.past, state.doc], future, selection: kept(next, state.selection) })
}

export function updateSettings(recipe: (settings: Settings) => Settings) {
  set({ settings: recipe(state.settings) })
}

// Saves the document and settings a moment after they change
let saving: ReturnType<typeof setTimeout> | undefined
let saved = { doc: state.doc, settings: state.settings }

subscribe(() => {
  if (state.doc === saved.doc && state.settings === saved.settings) return
  clearTimeout(saving)
  saving = setTimeout(() => {
    try {
      if (state.doc !== saved.doc) localStorage.setItem(DOC_KEY, JSON.stringify(state.doc))
      if (state.settings !== saved.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings))
    } catch {
      // Private browsing, or full: the work carries on unsaved
    }
    saved = { doc: state.doc, settings: state.settings }
  }, 300)
})
