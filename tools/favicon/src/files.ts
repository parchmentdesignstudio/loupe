import { makeIco, makeZip } from './encode.js'
import { drawing } from './frames'
import { makeIconPackage } from './iconfile.js'
import { layers, outputs } from './outputs'
import { canvasToBlob, pickSource, serialiseSvg } from './render.js'
import { STORAGE_KEY } from './specs.js'
import type { Art, Output, Site } from './types'

interface Downloads {
  save: (file: { filename: string; data: Blob }) => Promise<void>
}

declare global {
  interface Window {
    claude?: { use: (capability: string) => Promise<Downloads> }
  }
}

type Status = (text: string) => void

function absolute(path: string, site: Site) {
  try {
    return new URL(path, site.url || 'https://example.com').href
  } catch {
    return path
  }
}

export function headHtml(art: Art, site: Site): string {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    art.sources.some((source) => source.type === 'svg') ? '<link rel="icon" href="/icon.svg" type="image/svg+xml">' : null,
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/manifest.webmanifest">',
    `<meta name="theme-color" content="${site.theme}">`,
    `<meta property="og:image" content="${absolute('/og.png', site)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
  ]
    .filter(Boolean)
    .join('\n')
}

function manifest(art: Art, site: Site): string {
  const json = {
    name: site.name,
    short_name: site.short || site.name,
    icons: [
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/icon-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    theme_color: site.theme,
    background_color: art.background,
    display: 'standalone',
  }
  return JSON.stringify(json, null, 2) + '\n'
}

// When the tool runs inside Claude, files save through its downloads instead of a link
let downloads: Promise<Downloads | null> | undefined
function getDownloads() {
  if (!window.claude?.use) return null
  downloads ??= window.claude.use('downloads').catch(() => null)
  return downloads
}

async function saveFile(filename: string, blob: Blob, status: Status) {
  const host = await getDownloads()
  if (host) {
    try {
      await host.save({ filename, data: blob })
      status(`Saved ${filename}`)
    } catch (error) {
      if ((error as { code?: string })?.code !== 'declined') status(`${filename} couldn’t be saved here`)
    }
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function saveOutput(output: Output, filename: string, art: Art, status: Status) {
  await saveFile(filename, await canvasToBlob(await drawing(output, art)), status)
}

export async function buildFiles(art: Art, site: Site): Promise<{ path: string; data: Blob | string }[]> {
  const png = async (id: string) => canvasToBlob(await drawing(outputs.find((output) => output.id === id)!, art))
  const files = []

  files.push({ path: 'favicon.ico', data: await makeIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, blob: await png(`favicon-${size}`) })))) })
  const svg = pickSource(art.sources.filter((source) => source.type === 'svg'), 32)
  if (svg) files.push({ path: 'icon.svg', data: serialiseSvg(svg) })
  files.push({ path: 'apple-touch-icon.png', data: await png('apple-touch') })
  files.push({ path: 'icon-192.png', data: await png('icon-192') })
  files.push({ path: 'icon-512.png', data: await png('icon-512') })
  files.push({ path: 'icon-maskable-512.png', data: await png('maskable') })
  files.push({ path: 'og.png', data: await png('og') })
  files.push({ path: 'manifest.webmanifest', data: manifest(art, site) })
  files.push({ path: 'head.html', data: headHtml(art, site) + '\n' })

  const iconLayers = layers(art)
  if (iconLayers.length) files.push(...makeIconPackage(iconLayers, art, 'ios/AppIcon.icon'))
  for (const appearance of ['light', 'dark', 'tinted']) {
    files.push({ path: `ios/AppIcon-${appearance}.png`, data: await png(`ios-${appearance}`) })
  }
  return files
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site'
}

export async function exportZip(art: Art, site: Site, status: Status) {
  const files = await buildFiles(art, site)
  const zip = await makeZip(files)
  try {
    const names = files.map((file) => file.path.replace(/^ios\//, '').replace(/\/.*$/, ''))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: new Date().toISOString(), files: [...new Set(names)] }))
  } catch {}
  await saveFile(`${slug(site.name)}-icons.zip`, zip, status)
}
