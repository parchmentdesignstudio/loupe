# Device

A canvas for laying out devices and their screens. It starts from mcknny’s Mockup component: its 1776 × 1152 artboard, its phone and desktop frames, its layouts and its wireframes. Then it adds current phones, tablets, laptops and a display, drawn to the same build.

## Running it

```sh
pnpm install
pnpm dev
```

It opens on http://localhost:5190. Your work saves in the browser as you go: the document in local storage, and screenshots in IndexedDB.

## Using it

- Add a device from the left, with a click to put it in view, or drag it where it goes. Add device, in the toolbar floating along the bottom of the canvas, puts mcknny’s phone in view in one click.
- Drop a screenshot onto a device for its screen, or onto the canvas for a new device of the model it fits. Pasting works too, and double-clicking a device picks a file.
- Drag devices about, resize them from a corner, or line them up from the inspector.
- With nothing selected, the inspector sets the artboard’s size and fill, mcknny’s layouts, the grid, columns and guides.
- Export the artboard as a PNG at 1x, 2x or 3x. A clear artboard exports clear, as mcknny’s composed images are.

Light and dark switch the frames between mcknny’s two sets, for a light page or a dark one.

### Snapping

A drag snaps to whatever is within 6 points on screen:

- the artboard’s edges and centre
- other devices’ edges, centres and the spacing between them
- guides, which drag out of the rulers and back into them to go
- columns, while they’re shown
- the grid, 8 by default, when nothing else is near

Hold ⌘ to place something freely, or shift to keep to one axis. The magnet in the toolbar turns snapping off.

### Shortcuts

| Keys | Does |
|---|---|
| V, H | Select, pan |
| Space | Pans while held |
| ⌘Z, ⇧⌘Z | Undo, redo |
| ⌘C, ⌘V | Copy and paste devices, or paste a screenshot |
| ⌘D, ⌫ | Duplicate, delete |
| Alt and drag | Drags a copy |
| Arrows | Nudge a point, or a grid step with shift |
| ⌘], ⌘[ | Forward, backward, or with alt, to the front or back |
| ⇧1, ⇧2, ⇧0 | Zoom to fit, to the selection, to 100% |
| ⌘+, ⌘− | Zoom in, out |
| `⌘'` | Grid |
| ⇧G | Columns |
| ⇧R | Rulers |
| ⇧⌘H, ⇧⌘L | Hide, lock |
| ⇧⌘E | Export at 2x |

## Screens

Screens are sized in points, and the inspector says what to capture each one at. mcknny’s two match its screenshot script, `npm run screenshot` in mcknny: the phone is 404 × 906 at 3x, with the top 62 left for the status bar, and the desktop 1440 × 868 at 2x.

## Where things are

| Path | What’s there |
|---|---|
| `src/devices/models.ts` | Every device, with its screen in points |
| `src/devices/frames.ts` | The frames: mcknny’s SVGs for its phone and desktop, and the rest drawn to the same build |
| `src/devices/frames/` | mcknny’s frames, from its `src/assets/images/devices` |
| `src/devices/device-view.tsx` | A device in layers: frame, screen, status bar, then its island or notch |
| `src/editor/snapping.ts` | What a drag snaps to, with its tests beside it |
| `src/editor/canvas.tsx` | Panning, zooming, selecting and dragging |
| `src/editor/toolbar.tsx` | The toolbar along the top, and the one floating along the bottom of the canvas |
| `src/editor/overlay.tsx` | The grid, columns, guides, selection and snap lines, drawn at the screen’s size |
| `src/editor/export.ts` | The PNG, drawn as the canvas shows it |
| `src/ui/icon.tsx` | Loupe’s icons, with Lucide standing in for those it doesn’t have yet |

To add a device, list it in `models.ts` with its screen size in points, then give it a spec in `frames.ts`: a phone, tablet, laptop or display, with its screen’s corner radius and bezel.

Icons come from Loupe, `@parchment/icons`. Lucide stands in for any Loupe doesn’t have, under the name Loupe would give it, so each switches over once it’s drawn and released.

`pnpm test` runs the snapping tests.

`LOG.md` keeps a running log of changes while the tool is being simplified, with any controls that are in two places until one goes.
