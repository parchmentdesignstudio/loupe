# Log

Steve is simplifying the tool one change at a time, to make it more automatic. Nothing comes out until a change settles, since a later idea may build on an earlier one. Where something new repeats a control, both stay, and the overlap is listed here until one goes for good.

Each change is trying, settled or dropped.

## Overlaps to settle

| Control | Where it was | Repeated in |
|---|---|---|
| Select, pan | Top toolbar | Floating toolbar, from 1 |
| Undo, redo | Top toolbar | Floating toolbar, from 1 |
| Placing devices | Free, with snapping, the grid, columns and guides | The automatic row, from 2. Free stays under Layout for now, until Steve has used the row |

## Changes

### 1. Floating toolbar

27 October 2026 · Trying

Asked for: a floating toolbar along the bottom that repeats some of the quick actions at the top left, with an action that adds a new device with its defaults. The top toolbar stays as it is.

- It floats over the bottom of the canvas, centred on what’s in view: select, pan, Add device, undo, redo
- Add device puts mcknny’s phone in the middle of the view, 380 wide as its Mockup has it, and selects it, as a click in the library did. With the row from 2, it goes into the row instead
- Where a device already sits about there, as the middle of mcknny’s three does, the new one steps on by 24 rather than hiding it. Before, only an exact match stepped on, which snapping to the grid rarely left. This is free placing only, from 2
- Adding a device, in any way, switches back to select, so it’s ready to move
- Snapping, grid, columns and rulers stay at the top only
- Both toolbars share the same select, pan, undo and redo buttons, so either set can go without touching the other

### 2. Automatic row

27 October 2026 · Trying

Asked for: devices that set themselves out like an automatic flexbox, centred and fitting what they can. Adding a few, or changing one to a desktop, may run over the artboard, and that’s up to Steve. Then mcknny’s layout buttons can go.

- Devices sit in a row, each its own size, 57 apart as mcknny’s Mockup has them, centred across and down the artboard. Too many run over both edges alike
- Anything that changes a device lays the row out afresh: adding, removing, resizing, changing its model, turning a tablet, undoing
- Add device goes in after the selection, or at the end. A screenshot dropped on the canvas goes in where it lands
- Dragging a device moves it along the row: the rest make room, and it settles into its place when let go. The arrow keys move it one along, or to either end with shift, as ⌘[ and ⌘] do
- Resizing from a corner grows it about its middle
- Changing a device with one of mcknny’s wireframes from a phone to a laptop or desktop swaps in the desktop wireframe, and back
- The inspector’s Layout is Automatic or Free, with the gap. In the row, a device shows its size without a position, and Arrange moved it left or right rather than lining it up, until 5 took Arrange out of the row
- Free keeps the old way: each device where it’s put, snapping to the others, the grid and guides. The grid, columns, guides and snapping settings only show with Free
- Removed: mcknny’s layouts, Three phones, Two phones, One phone, Cropped phone and Desktop. The row makes all but Cropped phone, a phone 1072 wide from 187 down and cut off by the bottom edge, which Free can still do by hand

### 3. No layers or devices panel

27 October 2026 · Trying

Asked for: the left panel to go, as shortcuts are enough and there’ll never be hundreds of layers.

- Removed: the layers list, with selecting, renaming, hiding and locking from it, and the device library, with its click or drag to add any model
- Hide and lock went with it, ⇧⌘H and ⇧⌘L too: with the list gone, nothing could bring a device back. Any device saved hidden or locked shows again
- Adding a particular model is now Add device, then picking the model in the inspector. A screenshot dropped on the canvas still becomes the model it fits
- Seven Lucide stand-ins aren’t needed any more: iphone, ipad, laptopcomputer, eye, eye-slash, lock and lock-open

### 4. No start again

27 October 2026 · Trying

Asked for: the start again section to go, as it isn’t needed.

- Removed: Start again at the foot of the inspector, which put mcknny’s three phones back on its artboard
- With nothing saved, the tool still opens on those three phones

### 5. No arrange panel in the row

27 October 2026 · Trying

Asked for: the arrange panel to go.

- Gone from the row: moving along it, duplicating and deleting all have shortcuts, ←, →, ⌘D and ⌫, and a device drags along the row too
- Free keeps it, as lining up and spacing evenly have no shortcuts. It goes if Free does

### 6. Controls from @parchment/ui

9 November 2026 · Trying

Asked for: the toolbar, inspector and menus rebuilt with Loupe’s own components from `packages/ui`, used as they are, to find what the library is missing. The canvas, devices, frames and export stay as they were.

- Select and pan, the theme, orientation, status bar and layout are each a `ToggleButtonGroup`. Snapping, grid, columns and rulers are one group that takes several at once, and the inspector button is a `ToggleButton`
- Undo, redo, zooming out and in, and the arrange buttons are ghost circle `Button`s, with a `Tooltip` for the name and shortcut that `title` gave before. Add device, Choose, Remove and Clear are `Button`s too
- Zoom and export open a `Menu` from a `MenuTrigger`, rather than the browser’s popover
- The model and the artboard’s size are a `Select`, with the models under a heading for each kind. A mix of models shows Mixed, and a size that isn’t one of the presets shows Custom
- The artboard’s size, the gap, the grid and the columns are `NumberField`s, with a label above each and buttons to step it. The checkboxes are `Switch`es, as each takes effect at once
- The type and colours are the library’s: Elza Round at its sizes, with Auger Mono for section titles, from Adobe Fonts kit peo4gpu, which has both. A dark system sets the library’s colours from mcknny’s olive and pearl
- The inspector is 288 wide, up from 256, as the library’s fields have 16px text and their buttons inside
- Still local: a device’s position and size, as the library’s `NumberField` steps to whole multiples, which a height worked out from the width falls just short of, so it never steps up. Sections, notes and dividers, the screenshot’s thumbnail and the fill swatches are local too, as the library has nothing like them yet
- A control focused by a click gives Space and the arrows back to the canvas, so Space still pans and the arrows still move devices after clicking a button. An open list or menu keeps its keys, so Backspace there deletes nothing
- Circles stay round: the squircle corners leave out `rounded-full`

### 7. The library’s new components

10 November 2026 · Trying

Asked for: the toolbars, shortcuts, fill and screenshot picker moved onto the components `packages/ui` has gained since 6, to stress-test them.

- Both toolbars are a `Toolbar`: one Tab stop each, with the arrow keys along it, through the tool and snapping groups too. `Separator`s replace the dividers. A control clicked with the mouse still hands Space and the arrows back to the canvas
- Shortcuts in tooltips and menus are the library’s `Keyboard`. In a menu it sits at the end of the row
- The fill is a `ColorSwatchPicker`: eight squares to a row, the presets then Another colour. React Aria can’t read oklch, so each preset shows its nearest hex, and the artboard keeps the oklch
- Another colour opens a `ColorArea`, a hue `ColorSlider` and a hex `ColorField` in a `Popover`, in place of the browser’s colour picker. The colour chosen fills its square, ringed as a chosen preset is
- The screenshot’s thumbnail and Choose are each a `Button` in a `FileTrigger`. Double-clicking a device still picks a file, as before
- Still local: a device’s position and size, and the inspector’s sections and notes

### 8. Option-click to the code

10 November 2026 · Trying

Asked for: a way to Option-click something on the page and open where it’s written, to edit it.

- Holding Option outlines what’s under the pointer and names where it’s used, then after ⇧ where its component draws it, such as `<Icon> toolbar.tsx:24   ⇧ <LoupeIcon> icon.tsx:51`
- Option-click opens the first in Nova at that line, and Option-Shift-click the second. The click does nothing else, so a button isn’t pressed
- Option-dragging a device still duplicates it, as from 3px it’s a drag
- Loupe’s components arrive built, so the inside of a `Button` opens from `packages/ui`’s preview, not here
- It’s `scripts/locate.mjs`, a Vite plugin shared with that preview and the favicon tool, and only runs in `pnpm dev`

### 9. The library’s backgrounds and theme

11 November 2026 · Trying

Asked for: the new look and feel of `packages/ui`’s preview, for the backgrounds and the theme.

- The canvas is a card: panel, with `rounded-xl` and the library’s raised shadow, on the ground. The toolbar and the inspector sit on the ground round it, without a panel or dividing lines
- Light and dark are the library’s throughout. The olive and pearl in the dark, the workspace colour, and the rulers’ and overlay’s own colours give way to its ground, panel, bleed and muted, so a dark system now gets its pine, as 6 had it in the light only. The rulers read the tokens as they draw
- An Appearance menu by Export sets light, dark or the system’s for the tool, kept between visits, as the preview’s Appearance does. The Light and Dark beside Zoom still set the devices’ own theme
- Kept: mcknny’s avocado, thulian and tango for the selection, gaps and guides, as they mark the canvas rather than colour the tool. Thulian is in oklch now, the same colour
- Repeats: the theme toggle and the Appearance menu both say light and dark, for the devices and the tool

### 10. The library’s tokens by their Tailwind names

11 November 2026 · Settled

Asked for, in `packages/ui`: each token set once, as Tailwind’s own variable, rather than a Tailwind name pointing at a second one.

- The rulers read `--color-panel` and `--color-muted` rather than `--panel` and `--muted`, as the short names are gone
- The overlay’s labels on thulian and tango are `text-pine-26`, now the palette has utilities, rather than `text-(color:--pine-26)`. The same colour

### 11. The library’s button variants renamed

12 November 2026 · Settled

Asked for, in `packages/ui`: buttons named primary, secondary, accent, outline and ghost.

- The inspector’s white raised button for choosing a screen, tertiary before, is `secondary`. It looks the same
- The toolbar and inspector’s bare buttons, quiet before, are `ghost`. They look the same
