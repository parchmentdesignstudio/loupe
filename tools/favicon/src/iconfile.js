// Writes an Icon Composer .icon package: icon.json plus an Assets folder.
//
// Apple doesn't document the format. This follows what Icon Composer saves:
// layers are centred by default, `scale` is relative to the artwork's own
// size in points and the canvas is 1024 points square.

import { hexToRgb, serialiseSvg } from './render.js'

const CANVAS = 1024

function colour(hex) {
  return `srgb:${hexToRgb(hex).map((v) => (v / 255).toFixed(5)).join(',')},1.00000`
}

function assetName(layer, index, taken) {
  const ext = layer.source.type === 'svg' ? 'svg' : (layer.source.name.split('.').pop() || 'png').toLowerCase()
  const stem = layer.source.name.replace(/\.[^.]+$/, '').replace(/[^\w -]+/g, '').trim() || `layer-${index + 1}`
  let name = `${stem}.${ext}`
  let n = 2
  while (taken.has(name)) name = `${stem} ${n++}.${ext}`
  taken.add(name)
  return name
}

function round(n) {
  return Math.round(n * 10000) / 10000
}

export function makeIconPackage(layers, state, folder = 'AppIcon.icon') {
  const taken = new Set()
  const assets = []
  const groups = layers.map((layer, i) => {
    const name = assetName(layer, i, taken)
    assets.push({
      path: `${folder}/Assets/${name}`,
      data: layer.source.type === 'svg' ? serialiseSvg(layer.source) : layer.source.file,
    })
    const longest = Math.max(layer.source.width, layer.source.height)
    return {
      layers: [
        {
          glass: layer.glass,
          'image-name': name,
          name: name.replace(/\.[^.]+$/, ''),
          position: {
            scale: round((CANVAS * layer.scale) / longest),
            'translation-in-points': [0, 0],
          },
        },
      ],
      shadow: { kind: 'neutral', opacity: 0.5 },
      translucency: { enabled: true, value: 0.5 },
    }
  })

  const fill = state.ios.fill === 'gradient'
    ? { 'automatic-gradient': colour(state.background) }
    : { solid: colour(state.background) }

  const json = {
    'fill-specializations': [
      { value: fill },
      { appearance: 'dark', value: 'system-dark' },
    ],
    groups,
    'supported-platforms': {
      circles: ['watchOS'],
      squares: 'shared',
    },
  }

  return [{ path: `${folder}/icon.json`, data: JSON.stringify(json, null, 2) + '\n' }, ...assets]
}
