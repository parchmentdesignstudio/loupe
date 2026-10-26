import { frameArt, homeIndicatorBox, homeIndicatorColour, statusBar, statusBarBox, type Radius } from '../devices/frames'
import type { Doc } from './document'
import { decode, imageElement } from './images'

/** An SVG drawn at the size it takes in pixels, so it’s as crisp as the rest */
function raster(source: string, width: number, height: number): Promise<HTMLImageElement> {
  const sized = source.replace(/<svg\b([^>]*)>/, (_, attributes: string) => {
    const rest = attributes.replace(/\s(width|height)="[^"]*"/g, '')
    return `<svg width="${Math.ceil(width)}" height="${Math.ceil(height)}"${rest}>`
  })
  return decode(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`)
}

const radii = (radius: Radius) => (typeof radius === 'number' ? radius : [...radius])

/**
 * The artboard as a PNG, drawn as the canvas shows it: each device’s frame,
 * its screenshot covering the screen from the top, its status bar and home
 * indicator, then its island or notch, cut off at the artboard’s edge
 */
export async function renderPng(doc: Doc, scale: number): Promise<Blob> {
  const { width, height, fill } = doc.artboard
  const canvas = Object.assign(document.createElement('canvas'), { width: Math.round(width * scale), height: Math.round(height * scale) })
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser can’t draw the image')
  context.scale(scale, scale)
  if (fill) {
    context.fillStyle = fill
    context.fillRect(0, 0, width, height)
  }

  for (const device of doc.devices) {
    if (device.hidden) continue
    const art = frameArt(device.model, device.orientation, doc.theme)
    const { layout } = art
    const { screen } = layout
    const size = device.width / layout.width
    const pixels = size * scale

    context.save()
    context.translate(device.x, device.y)
    context.scale(size, size)
    context.drawImage(await raster(art.under, layout.width * pixels, layout.height * pixels), 0, 0, layout.width, layout.height)

    const image = device.screen ? await imageElement(device.screen) : null
    if (image) {
      const cover = Math.max(screen.width / image.naturalWidth, screen.height / image.naturalHeight)
      const drawn = { width: image.naturalWidth * cover, height: image.naturalHeight * cover }
      context.save()
      context.beginPath()
      context.roundRect(screen.x, screen.y, screen.width, screen.height, radii(screen.radius))
      context.clip()
      context.drawImage(image, screen.x + (screen.width - drawn.width) / 2, screen.y, drawn.width, drawn.height)
      context.restore()
    }

    if (layout.phone && device.statusBar !== 'none') {
      const bar = statusBarBox(layout)
      context.drawImage(await raster(statusBar(screen.width, device.statusBar), bar.width * pixels, bar.height * pixels), bar.x, bar.y, bar.width, bar.height)
      const home = homeIndicatorBox(layout)
      context.fillStyle = homeIndicatorColour[device.statusBar]
      context.beginPath()
      context.roundRect(home.x, home.y, home.width, home.height, home.height / 2)
      context.fill()
    }

    if (art.over) context.drawImage(await raster(art.over, layout.width * pixels, layout.height * pixels), 0, 0, layout.width, layout.height)
    context.restore()
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The image couldn’t be made'))), 'image/png')
  })
}
