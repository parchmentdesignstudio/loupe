# Log

Steve is simplifying the tool one change at a time, to make it more automatic. Nothing comes out until a change settles, since a later idea may build on an earlier one. Where something new repeats a control, both stay, and the overlap is listed here until one goes for good.

Each change is trying, settled or dropped.

## Overlaps to settle

| Control | Where it was | Repeated in |
|---|---|---|
| Select, pan | Top toolbar | Floating toolbar, from 1 |
| Undo, redo | Top toolbar | Floating toolbar, from 1 |
| Placing devices | Free, with snapping, the grid, columns and guides | The automatic row, from 2. Free is still there, under Layout |

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
- The inspector’s Layout is Automatic or Free, with the gap. In the row, a device shows its size without a position, and Arrange moves it left or right rather than lining it up
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
