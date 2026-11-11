import { useEffect, useSyncExternalStore } from 'react'
import desktopHome from '../samples/desktop-home.png'
import phoneDark from '../samples/phone-dark.png'
import phoneHome from '../samples/phone-home.png'
import phoneList from '../samples/phone-list.png'

// mcknny’s wireframes, from its Mockup stories
const samples: Record<string, string> = {
  'sample:phone-home': phoneHome,
  'sample:phone-list': phoneList,
  'sample:phone-dark': phoneDark,
  'sample:desktop-home': desktopHome,
}

// Screenshots live in IndexedDB, so they survive a reload with the document
let database: Promise<IDBDatabase> | null = null

function open(): Promise<IDBDatabase> {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('device', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('images')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return database
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const request = action(db.transaction('images', mode).objectStore('images'))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const urls = new Map<string, string>()
const loading = new Set<string>()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

function notify() {
  for (const listener of listeners) listener()
}

export function imageUrl(id: string | null): string | null {
  if (!id) return null
  return samples[id] ?? urls.get(id) ?? null
}

// Kept as bytes rather than a Blob, which Safari can’t store in a private window
interface Stored {
  type: string
  data: ArrayBuffer
}

async function load(id: string) {
  if (loading.has(id) || imageUrl(id)) return
  loading.add(id)
  try {
    const stored = await run<Stored | Blob | undefined>('readonly', (store) => store.get(id))
    if (stored) {
      urls.set(id, URL.createObjectURL(stored instanceof Blob ? stored : new Blob([stored.data], { type: stored.type })))
      notify()
    }
  } catch {
    // Not saved, so it can’t show
  } finally {
    loading.delete(id)
  }
}

export function useImageUrl(id: string | null): string | null {
  const url = useSyncExternalStore(subscribe, () => imageUrl(id))
  useEffect(() => {
    if (id && !url) void load(id)
  }, [id, url])
  return url
}

/** Loads an image to draw, such as for an export */
export async function imageElement(id: string): Promise<HTMLImageElement | null> {
  await load(id)
  const url = imageUrl(id)
  return url ? decode(url) : null
}

export function decode(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That image couldn’t be read'))
    image.src = url
  })
}

export interface Added {
  id: string
  width: number
  height: number
  /** The status bar’s colour to read over its top: light over a dark one */
  statusBar: 'dark' | 'light'
}

export async function addImage(file: Blob): Promise<Added> {
  const url = URL.createObjectURL(file)
  const image = await decode(url).catch((error) => {
    URL.revokeObjectURL(url)
    throw error
  })
  const id = crypto.randomUUID()
  const stored: Stored = { type: file.type, data: await file.arrayBuffer() }
  // It shows either way, but only comes back after a reload once it’s saved
  await run('readwrite', (store) => store.put(stored, id)).catch(() => {})
  urls.set(id, url)
  notify()
  return { id, width: image.naturalWidth, height: image.naturalHeight, statusBar: topTone(image) }
}

/** As mcknny’s screenshot script decides: light text over a dark top */
function topTone(image: HTMLImageElement): 'dark' | 'light' {
  const canvas = Object.assign(document.createElement('canvas'), { width: 32, height: 1 })
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return 'dark'
  context.drawImage(image, 0, 0, image.naturalWidth, Math.max(1, image.naturalHeight * 0.01), 0, 0, 32, 1)
  const data = context.getImageData(0, 0, 32, 1).data
  let total = 0
  for (let index = 0; index < data.length; index += 4) {
    total += (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) / 255
  }
  return total / 32 < 0.5 ? 'light' : 'dark'
}

/** Forgets screenshots nothing uses any more, when a session starts */
export async function prune(used: Set<string>) {
  const keys = await run<IDBValidKey[]>('readonly', (store) => store.getAllKeys())
  await Promise.all(keys.filter((key) => !used.has(String(key))).map((key) => run('readwrite', (store) => store.delete(key))))
}
