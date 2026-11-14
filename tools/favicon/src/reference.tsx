import { Icon } from '@parchment/icons/react'
import { Link } from '@parchment/ui'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { REFERENCE, STORAGE_KEY } from './specs.js'

interface Export {
  at?: string
  files: string[]
}

interface Platform {
  platform: string
  items: { name: string; size: string; also?: string; need: string; file?: string; note: string }[]
}

const platforms: Platform[] = REFERENCE

function lastExport(): Export {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved && JSON.parse(saved)) || { files: [] }
  } catch {
    return { files: [] }
  }
}

const cell = 'border-b border-bleed/8 px-3.5 py-2.5 text-left align-top group-last:border-b-0'

function Reference() {
  const made = lastExport()
  const have = new Set(made.files)
  const when = made.at && new Date(made.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto flex max-w-240 flex-col gap-10 pt-6 pb-16 pr-[max(--spacing(4),env(safe-area-inset-right,0px))] pl-[max(--spacing(4),env(safe-area-inset-left,0px))]">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h1 className="text-title font-medium">Icon sizes reference</h1>
        <p className="text-muted">
          {when && `Ticks show what you exported on ${when}. `}
          <Link href="index.html">Favicon</Link>
        </p>
      </header>
      {platforms.map((group) => (
        <section key={group.platform} className="flex flex-col gap-3">
          <h2 className="text-base font-medium">{group.platform}</h2>
          <div className="overflow-x-auto rounded-lg bg-panel shadow-panel [--bleed:var(--panel-bleed)]">
            <table className="w-full border-collapse">
              <thead className="bg-bleed/4 text-muted">
                <tr>
                  <th scope="col" className={`${cell} w-10`}>
                    <span className="sr-only">Exported</span>
                  </th>
                  <th scope="col" className={`${cell} font-medium`}>
                    File
                  </th>
                  <th scope="col" className={`${cell} font-medium`}>
                    Size
                  </th>
                  <th scope="col" className={`${cell} font-medium`}>
                    Needed
                  </th>
                  <th scope="col" className={`${cell} font-medium`}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.name} className="group">
                    <td className={`${cell} text-center`}>{item.file && have.has(item.file) && <Icon name="checkmark" label="Exported" className="inline-block" />}</td>
                    <td className={`${cell} font-medium whitespace-nowrap`}>{item.name}</td>
                    <td className={`${cell} font-mono text-label whitespace-nowrap tabular-nums`}>
                      {item.size}
                      {item.also && <span className="block text-muted">{item.also}</span>}
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>{item.need}</td>
                    <td className={`${cell} min-w-64 text-muted`}>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Reference />
  </StrictMode>,
)
