import { Keyboard, Tooltip, TooltipTrigger, type TooltipProps } from '@parchment/ui'
import { useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'
import { round } from '../editor/geometry'

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

export function format(value: number): string {
  return String(round(value))
}

/** A device’s position or size, stepped from its value with the arrows, ten at a time with shift. @parchment/ui’s
 * NumberField steps to a multiple of its step, which a height worked out from the width falls short of every time */
export function BoundsField({ label, title, value, onChange, min }: { label: string; title: string; value: number; onChange: (value: number) => void; min?: number }) {
  const [draft, setDraft] = useState<string | null>(null)
  const limit = (next: number) => round(min === undefined ? next : Math.max(min, next))

  const commit = () => {
    if (draft === null) return
    const parsed = Number.parseFloat(draft)
    setDraft(null)
    if (Number.isFinite(parsed) && parsed !== value) onChange(limit(parsed))
  }

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit()
    else if (event.key === 'Escape') {
      setDraft(null)
      event.currentTarget.blur()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const base = draft === null ? value : Number.parseFloat(draft) || 0
      setDraft(null)
      onChange(limit(base + (event.key === 'ArrowUp' ? 1 : -1) * (event.shiftKey ? 10 : 1)))
    }
  }

  return (
    <label title={title} className="flex min-w-0 items-center gap-2 rounded-lg bg-raised px-3 py-1.5 text-control shadow-raised outline-offset-0 outline-ink focus-within:outline-2">
      <span aria-hidden="true" className="shrink-0 text-muted">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={title}
        value={draft ?? format(value)}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={keyDown}
        className="w-full min-w-0 bg-transparent text-ink tabular-nums outline-none"
      />
    </label>
  )
}

/** A control with its tooltip, and the shortcut that does the same */
export function WithTooltip({
  tooltip,
  shortcut,
  placement,
  children,
}: {
  tooltip: string
  shortcut?: string
  placement?: TooltipProps['placement']
  children: ReactElement
}) {
  return (
    <TooltipTrigger delay={500}>
      {children}
      <Tooltip placement={placement}>
        {tooltip}
        {shortcut && <Keyboard>{shortcut}</Keyboard>}
      </Tooltip>
    </TooltipTrigger>
  )
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-bleed/8 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="truncate font-mono text-label text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-label text-pretty text-muted">{children}</p>
}
