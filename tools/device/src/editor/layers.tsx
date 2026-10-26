import { useState, type MouseEvent } from 'react'
import type { Kind } from '../devices/models'
import { cx, IconButton, Note, Section } from '../ui/controls'
import { Icon, type Name } from '../ui/icon'
import * as actions from './actions'
import { kindOf, nameOf } from './document'
import { get, useStore } from './store'

export const kindIcons: Record<Kind, Name> = { phone: 'iphone', tablet: 'ipad', laptop: 'laptopcomputer', desktop: 'display' }

/** Devices on the artboard, front first */
export function Layers() {
  const devices = useStore((state) => state.doc.devices)
  const selection = useStore((state) => state.selection)
  const [renaming, setRenaming] = useState<string | null>(null)

  const pick = (id: string, event: MouseEvent) => {
    const { selection } = get()
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      actions.select(selection.includes(id) ? selection.filter((each) => each !== id) : [...selection, id])
    } else actions.select([id])
  }

  return (
    <Section title="Layers">
      {devices.length === 0 ? (
        <Note>Nothing on the artboard yet. Add a device below, or drop a screenshot on the canvas.</Note>
      ) : (
        <ul className="-mx-1.5 flex flex-col">
          {[...devices].reverse().map((device) => {
            const selected = selection.includes(device.id)
            return (
              <li
                key={device.id}
                className={cx(
                  'group flex h-8 items-center gap-1 rounded-md pr-0.5 pl-1.5',
                  selected ? 'bg-avocado/15 dark:bg-avocado/25' : 'hover:bg-olive-100 dark:hover:bg-olive-900',
                )}
              >
                <Icon name={kindIcons[kindOf(device)]} className="shrink-0 text-olive-975/60 dark:text-pearl/60" />
                {renaming === device.id ? (
                  <input
                    autoFocus
                    aria-label="Name"
                    defaultValue={nameOf(device)}
                    onFocus={(event) => event.currentTarget.select()}
                    onBlur={(event) => {
                      actions.rename(device.id, event.currentTarget.value)
                      setRenaming(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                      if (event.key === 'Escape') setRenaming(null)
                    }}
                    className="h-6 min-w-0 flex-1 rounded bg-white px-1 text-[13px] outline-2 outline-avocado dark:bg-olive-950"
                  />
                ) : (
                  <button
                    type="button"
                    aria-pressed={selected}
                    title="Double-click to rename"
                    onClick={(event) => pick(device.id, event)}
                    onDoubleClick={() => setRenaming(device.id)}
                    className={cx('h-full min-w-0 flex-1 truncate px-1 text-left text-[13px] outline-avocado focus-visible:outline-2', device.hidden && 'opacity-50')}
                  >
                    {nameOf(device)}
                  </button>
                )}
                <IconButton
                  icon={device.hidden ? 'eye-slash' : 'eye'}
                  label={device.hidden ? `Show ${nameOf(device)}` : `Hide ${nameOf(device)}`}
                  onClick={() => actions.toggleHidden([device.id])}
                  className={cx('size-7', !device.hidden && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}
                />
                <IconButton
                  icon={device.locked ? 'lock' : 'lock-open'}
                  label={device.locked ? `Unlock ${nameOf(device)}` : `Lock ${nameOf(device)}`}
                  onClick={() => actions.toggleLocked([device.id])}
                  className={cx('size-7', !device.locked && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100')}
                />
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
