import { memo } from 'react'
import { frameArt, homeIndicatorBox, homeIndicatorColour, radiusCss, statusBar, statusBarBox, svgUrl, type Tone } from './frames'
import type { Orientation, Theme } from './models'

export interface DeviceViewProps {
  model: string
  orientation: Orientation
  theme: Theme
  /** How wide it shows, which scales everything on it together */
  width: number
  /** The screenshot’s address */
  screen: string | null
  statusBar: Tone | 'none'
  /** Asks for a screenshot when the screen’s empty */
  hint?: boolean
}

// A device at its own size, in layers: the frame, the screen, the status bar
// and home indicator, then the island, camera or notch. A scale sizes them
// together, as mcknny’s Phone and Desktop do, so they stay in step and crisp
export const DeviceView = memo(function DeviceView({ model, orientation, theme, width, screen, statusBar: tone, hint = false }: DeviceViewProps) {
  const art = frameArt(model, orientation, theme)
  const { layout } = art
  const { screen: box } = layout
  const scale = width / layout.width
  const bar = statusBarBox(layout)
  const home = homeIndicatorBox(layout)

  return (
    <div className="relative" style={{ width, height: layout.height * scale }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: layout.width, height: layout.height, scale }}>
        <img src={svgUrl(art.under)} alt="" draggable={false} className="absolute inset-0 size-full" />
        <div
          className="absolute grid place-items-center overflow-hidden"
          style={{ left: box.x, top: box.y, width: box.width, height: box.height, borderRadius: radiusCss(box.radius) }}
        >
          {screen ? (
            <img src={screen} alt="" draggable={false} className="size-full object-cover object-top" />
          ) : (
            hint && (
              <p className="text-center text-white/40" style={{ fontSize: box.width * 0.045 }}>
                Drop a screenshot
              </p>
            )
          )}
        </div>
        {layout.phone && tone !== 'none' && (
          <>
            <img
              src={svgUrl(statusBar(box.width, tone))}
              alt=""
              draggable={false}
              className="absolute"
              style={{ left: bar.x, top: bar.y, width: bar.width, height: bar.height }}
            />
            <span
              className="absolute"
              style={{ left: home.x, top: home.y, width: home.width, height: home.height, borderRadius: home.height, background: homeIndicatorColour[tone] }}
            />
          </>
        )}
        {art.over && <img src={svgUrl(art.over)} alt="" draggable={false} className="absolute inset-0 size-full" />}
      </div>
    </div>
  )
})
