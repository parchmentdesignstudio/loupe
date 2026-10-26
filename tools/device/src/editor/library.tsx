import { DeviceView } from '../devices/device-view'
import { layoutOf } from '../devices/frames'
import { kinds, models, upright, type Model } from '../devices/models'
import { Note, Section } from '../ui/controls'
import * as actions from './actions'

// A pale screen, so a device this small reads by its shape rather than its black bezel
const screen = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="#dfe3da"/></svg>')}`

function Thumbnail({ model }: { model: Model }) {
  const orientation = upright(model)
  const layout = layoutOf(model.id, orientation)
  const scale = Math.min(28 / layout.width, 28 / layout.height)
  return (
    <span className="grid size-7 shrink-0 place-items-center">
      <DeviceView model={model.id} orientation={orientation} theme="light" width={layout.width * scale} screen={screen} statusBar="none" />
    </span>
  )
}

/** Every device, to add with a click or drag onto the canvas */
export function Library() {
  return (
    <Section title="Add a device">
      <Note>Click to add one in view, or drag it where it goes.</Note>
      {kinds.map(({ kind, name }) => (
        <div key={kind} className="flex flex-col">
          <h3 className="mt-1 mb-0.5 text-xs text-olive-975/50 dark:text-pearl/50">{name}</h3>
          <ul className="-mx-1.5 flex flex-col">
            {models
              .filter((model) => model.kind === kind)
              .map((model) => (
                <li key={model.id}>
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(actions.MODEL_TYPE, model.id)
                      event.dataTransfer.effectAllowed = 'copy'
                    }}
                    onClick={() => actions.addDevice(model.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left text-[13px] outline-avocado hover:bg-olive-100 focus-visible:outline-2 dark:hover:bg-olive-900"
                  >
                    <Thumbnail model={model} />
                    <span className="min-w-0 flex-1 truncate">{model.name}</span>
                    <span className="text-xs text-olive-975/50 tabular-nums dark:text-pearl/50">
                      {model.screen.width} × {model.screen.height}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}
