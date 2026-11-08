import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { round } from '../editor/geometry'
import { Icon, type Name } from './icon'

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

const quiet = 'text-olive-975/60 dark:text-pearl/60'

export function IconButton({
  icon,
  label,
  shortcut,
  pressed,
  disabled,
  onClick,
  className,
}: {
  icon: Name
  label: string
  shortcut?: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'grid size-8 shrink-0 place-items-center rounded-md text-olive-975/70 outline-avocado',
        'hover:bg-olive-100 hover:text-olive-975 focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-35',
        'aria-pressed:bg-olive-120 aria-pressed:text-olive-975',
        'dark:text-pearl/70 dark:hover:bg-olive-900 dark:hover:text-pearl dark:aria-pressed:bg-olive-900 dark:aria-pressed:text-pearl',
        className,
      )}
    >
      <Icon name={icon} />
    </button>
  )
}

/** Buttons that pick one of a few, as mcknny’s components page has them */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: T | null
  options: { value: T; label: string; icon?: Name }[]
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div role="group" aria-label={label} className={cx('flex items-center gap-0.5 rounded-lg bg-olive-100 p-0.5 dark:bg-olive-950', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cx(
            'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-medium whitespace-nowrap text-olive-975/70 outline-avocado',
            'hover:text-olive-975 focus-visible:outline-2 aria-pressed:bg-white aria-pressed:text-olive-975 aria-pressed:shadow-hairline',
            'dark:text-pearl/70 dark:hover:text-pearl dark:aria-pressed:bg-olive-900 dark:aria-pressed:text-pearl dark:aria-pressed:shadow-dark-hairline',
          )}
        >
          {option.icon && <Icon name={option.icon} />}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function format(value: number): string {
  return String(round(value))
}

/** A number to type or step with the arrow keys, ten at a time with shift */
export function NumberField({
  label,
  title,
  value,
  onChange,
  step = 1,
  min,
  suffix,
}: {
  label: string
  title: string
  value: number | null
  onChange: (value: number) => void
  step?: number
  min?: number
  suffix?: string
}) {
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
      const base = draft === null ? (value ?? 0) : Number.parseFloat(draft) || 0
      setDraft(null)
      onChange(limit(base + (event.key === 'ArrowUp' ? 1 : -1) * step * (event.shiftKey ? 10 : 1)))
    }
  }

  return (
    <label
      title={title}
      className="flex h-8 min-w-0 items-center gap-1.5 rounded-md bg-olive-100 px-2 text-[13px] outline-avocado focus-within:outline-2 dark:bg-olive-950"
    >
      <span aria-hidden="true" className={cx('shrink-0', quiet)}>
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={title}
        value={draft ?? (value === null ? '' : format(value))}
        placeholder={value === null ? 'Mixed' : undefined}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={keyDown}
        className="w-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-olive-975/40 dark:placeholder:text-pearl/40"
      />
      {suffix && <span className={cx('shrink-0', quiet)}>{suffix}</span>}
    </label>
  )
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-7 items-center gap-2 text-[13px]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-3.5 shrink-0 accent-avocado" />
      {label}
    </label>
  )
}

export function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="relative flex h-8 min-w-0 items-center rounded-md bg-olive-100 text-[13px] outline-avocado focus-within:outline-2 dark:bg-olive-950">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="size-full min-w-0 appearance-none bg-transparent pr-7 pl-2 outline-none">
        {children}
      </select>
      <Icon name="chevron-down" className="pointer-events-none absolute right-2 text-olive-975/50 dark:text-pearl/50" />
    </label>
  )
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-b border-olive-150 px-3 py-3 dark:border-olive-900">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <h2 className={cx('truncate text-xs font-medium', quiet)}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className={cx('text-xs text-pretty', quiet)}>{children}</p>
}

export function TextButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'flex h-8 items-center justify-center gap-1.5 rounded-md bg-olive-100 px-2.5 text-[13px] font-medium outline-avocado',
        'hover:bg-olive-120 focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-40 dark:bg-olive-950 dark:hover:bg-olive-900',
      )}
    >
      {children}
    </button>
  )
}

/** A menu that opens from its button, as a popover anchored beneath it */
export function Menu({ id, label, button, align = 'end', className, children }: { id: string; label: string; button: ReactNode; align?: 'start' | 'end'; className?: string; children: ReactNode }) {
  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-label={label}
        title={label}
        style={{ anchorName: `--${id}` }}
        className={cx('flex h-8 shrink-0 items-center gap-1.5 rounded-md outline-avocado focus-visible:outline-2', className)}
      >
        {button}
      </button>
      <div
        id={id}
        popover="auto"
        style={{ positionAnchor: `--${id}`, positionArea: align === 'end' ? 'bottom span-left' : 'bottom span-right' }}
        className="m-0 mt-1 min-w-48 rounded-lg bg-white p-1 text-[13px] text-olive-975 shadow-float [inset:auto] dark:bg-olive-950 dark:text-pearl dark:shadow-dark-float"
      >
        {children}
      </div>
    </>
  )
}

export function MenuItem({ menu, onClick, shortcut, children }: { menu: string; onClick: () => void; shortcut?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        document.getElementById(menu)?.hidePopover()
        onClick()
      }}
      className="flex h-8 w-full items-center justify-between gap-6 rounded-md px-2 text-left outline-avocado hover:bg-olive-100 focus-visible:outline-2 dark:hover:bg-olive-900"
    >
      <span>{children}</span>
      {shortcut && <span className={cx('tabular-nums', quiet)}>{shortcut}</span>}
    </button>
  )
}

export function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-olive-150 dark:bg-olive-900" />
}
