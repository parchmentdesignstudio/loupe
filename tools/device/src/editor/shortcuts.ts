import * as actions from './actions'
import { get, redo, set, undo } from './store'

function typing(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}

const arrows: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

function keyDown(event: KeyboardEvent) {
  if (typing(event.target)) return
  const { settings } = get()
  const command = event.metaKey || event.ctrlKey

  if (event.code === 'Space' && !command) {
    event.preventDefault()
    if (!get().spaceHeld) set({ spaceHeld: true })
    return
  }

  if (command) {
    const handled = () => event.preventDefault()
    if (event.code === 'KeyZ') return handled(), event.shiftKey ? redo() : undo()
    if (event.code === 'KeyY') return handled(), redo()
    if (event.code === 'KeyA') return handled(), actions.selectAll()
    if (event.code === 'KeyD') return handled(), actions.duplicate()
    if (event.code === 'Equal') return handled(), actions.zoomStep(1)
    if (event.code === 'Minus') return handled(), actions.zoomStep(-1)
    if (event.code === 'Digit0') return handled(), actions.zoomTo(1)
    if (event.code === 'Quote') return handled(), actions.setGrid({ visible: !settings.grid.visible })
    if (event.code === 'KeyE' && event.shiftKey) return handled(), void actions.exportImage(2)
    if (event.code === 'BracketRight') return handled(), actions.reorder(event.altKey ? 'front' : 'forward')
    if (event.code === 'BracketLeft') return handled(), actions.reorder(event.altKey ? 'back' : 'backward')
    return
  }

  if (event.code in arrows) {
    event.preventDefault()
    // In the row, along it, or with shift, to either end
    if (get().doc.artboard.layout === 'row') {
      if (event.code === 'ArrowLeft') actions.reorder(event.shiftKey ? 'back' : 'backward')
      if (event.code === 'ArrowRight') actions.reorder(event.shiftKey ? 'front' : 'forward')
      return
    }
    const distance = event.shiftKey ? (settings.snap && settings.grid.snap ? settings.grid.size : 10) : 1
    const [x, y] = arrows[event.code]
    return actions.nudge(x * distance, y * distance)
  }

  if (event.shiftKey) {
    if (event.code === 'Digit1') return actions.fitArtboard()
    if (event.code === 'Digit2') return actions.zoomToSelection()
    if (event.code === 'Digit0') return actions.zoomTo(1)
    if (event.code === 'KeyR') return actions.toggle('rulers')
    if (event.code === 'KeyG') return actions.setColumns({ visible: !settings.columns.visible })
    return
  }

  if (event.code === 'KeyV') return set({ tool: 'select' })
  if (event.code === 'KeyH') return set({ tool: 'hand' })
  if (event.code === 'Equal') return actions.zoomStep(1)
  if (event.code === 'Minus') return actions.zoomStep(-1)
  if (event.key === 'Escape') return actions.select([])
  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    return actions.removeSelected()
  }
}

function keyUp(event: KeyboardEvent) {
  if (event.code === 'Space') set({ spaceHeld: false })
}

function release() {
  set({ spaceHeld: false })
}

function copy(event: ClipboardEvent) {
  if (typing(event.target) || get().selection.length === 0) return
  // Clears an image from the clipboard, so a paste brings back the devices
  const count = actions.copySelection()
  event.clipboardData?.setData('text/plain', count === 1 ? '1 device' : `${count} devices`)
  event.preventDefault()
}

function cut(event: ClipboardEvent) {
  if (typing(event.target) || get().selection.length === 0) return
  copy(event)
  actions.removeSelected()
}

/** Pastes a screenshot onto the device selected, or as a new device, or else copied devices */
function paste(event: ClipboardEvent) {
  if (typing(event.target)) return
  const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith('image/'))
  event.preventDefault()
  if (files.length > 0) void actions.pasteImages(files)
  else actions.pasteDevices()
}

export function installShortcuts() {
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)
  window.addEventListener('blur', release)
  document.addEventListener('copy', copy)
  document.addEventListener('cut', cut)
  document.addEventListener('paste', paste)
  return () => {
    window.removeEventListener('keydown', keyDown)
    window.removeEventListener('keyup', keyUp)
    window.removeEventListener('blur', release)
    document.removeEventListener('copy', copy)
    document.removeEventListener('cut', cut)
    document.removeEventListener('paste', paste)
  }
}
