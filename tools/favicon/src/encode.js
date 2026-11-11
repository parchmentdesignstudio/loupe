// File formats the browser can't write on its own: .ico and .zip.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

const encoder = new TextEncoder()

async function toBytes(data) {
  if (typeof data === 'string') return encoder.encode(data)
  if (data instanceof Blob) return new Uint8Array(await data.arrayBuffer())
  return new Uint8Array(data)
}

// An .ico holding PNG frames, which every current browser and Windows reads.
export async function makeIco(pngBlobs) {
  const frames = await Promise.all(pngBlobs.map(async ({ size, blob }) => ({ size, bytes: await toBytes(blob) })))
  const headerSize = 6 + frames.length * 16
  const total = headerSize + frames.reduce((sum, f) => sum + f.bytes.length, 0)
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)
  view.setUint16(2, 1, true)
  view.setUint16(4, frames.length, true)
  let offset = headerSize
  frames.forEach((frame, i) => {
    const entry = 6 + i * 16
    out[entry] = frame.size >= 256 ? 0 : frame.size
    out[entry + 1] = frame.size >= 256 ? 0 : frame.size
    view.setUint16(entry + 4, 1, true)
    view.setUint16(entry + 6, 32, true)
    view.setUint32(entry + 8, frame.bytes.length, true)
    view.setUint32(entry + 12, offset, true)
    out.set(frame.bytes, offset)
    offset += frame.bytes.length
  })
  return new Blob([out], { type: 'image/x-icon' })
}

// A zip with no compression. PNGs are already compressed, so storing keeps
// the code small for little cost.
export async function makeZip(entries) {
  const now = new Date()
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  const files = await Promise.all(
    entries.map(async ({ path, data }) => {
      const bytes = await toBytes(data)
      return { name: encoder.encode(path), bytes, crc: crc32(bytes) }
    }),
  )

  const parts = []
  const central = []
  let offset = 0
  for (const file of files) {
    const local = new Uint8Array(30 + file.name.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x0800, true)
    lv.setUint16(10, time, true)
    lv.setUint16(12, date, true)
    lv.setUint32(14, file.crc, true)
    lv.setUint32(18, file.bytes.length, true)
    lv.setUint32(22, file.bytes.length, true)
    lv.setUint16(26, file.name.length, true)
    local.set(file.name, 30)
    parts.push(local, file.bytes)

    const entry = new Uint8Array(46 + file.name.length)
    const cv = new DataView(entry.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x0800, true)
    cv.setUint16(12, time, true)
    cv.setUint16(14, date, true)
    cv.setUint32(16, file.crc, true)
    cv.setUint32(20, file.bytes.length, true)
    cv.setUint32(24, file.bytes.length, true)
    cv.setUint16(28, file.name.length, true)
    cv.setUint32(42, offset, true)
    entry.set(file.name, 46)
    central.push(entry)
    offset += local.length + file.bytes.length
  }

  const centralSize = central.reduce((sum, c) => sum + c.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)
  return new Blob([...parts, ...central, end], { type: 'application/zip' })
}
