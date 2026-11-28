// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The tool is a megabyte of React and components, so loading it is what these watch for
const start = vi.fn(() => ({ toggle: vi.fn(), active: true, changes: () => ({ count: 2, text: 'two' }), commands: () => [] }))
vi.mock('../src/client.js', () => ({ start }))

const press = () => dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', key: '©', altKey: true }))

// Each test mounts afresh, so what the last one's loader listened for is taken off again
const listening = []
const listen = globalThis.addEventListener

beforeEach(() => {
  for (const heard of listening.splice(0)) removeEventListener(...heard)
  vi.stubGlobal('addEventListener', (...heard) => {
    listening.push(heard)
    listen.call(window, ...heard)
  })
  vi.resetModules()
  start.mockClear()
  sessionStorage.clear()
  delete window.parchmentCompose
})

describe('mount', () => {
  it('lists Compose for a site’s menu without loading the tool', async () => {
    const { mount } = await import('../src/loader.js')
    const compose = mount({ launcher: false })
    expect(compose.active).toBe(false)
    expect(compose.changes()).toEqual({ count: 0, text: '' })
    expect(compose.commands().map(({ name, keys }) => [name, keys])).toEqual([['Compose this page', '⌥G']])
    expect(mount({ launcher: false })).toBe(compose)
    await vi.dynamicImportSettled()
    expect(start).not.toHaveBeenCalled()
  })

  it('loads the tool and opens it when it’s first toggled on', async () => {
    const { mount } = await import('../src/loader.js')
    const compose = mount({ launcher: false })
    compose.toggle(false)
    await vi.dynamicImportSettled()
    expect(start).not.toHaveBeenCalled()
    compose.toggle(true)
    await vi.dynamicImportSettled()
    expect(start).toHaveBeenCalledOnce()
    expect(start.mock.results[0].value.toggle).toHaveBeenCalledWith(true)
    expect(compose.changes().count).toBe(2)
  })

  it('loads the tool by its shortcut, once', async () => {
    const { mount } = await import('../src/loader.js')
    mount({ launcher: false })
    press()
    press()
    await vi.dynamicImportSettled()
    expect(start).toHaveBeenCalledOnce()
  })
})
