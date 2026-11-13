# Icons to draw

Icons that loupe needs and the solid set doesn't have yet. Most turned up building the leads screen (`#/screens/leads` in the ui preview) with nothing but loupe. Names follow the set's SF Symbols style. Where the line set already has one, it's a head start on the shape.

## Drawn by hand in loupe/ui

These are SVGs inside the components, standing in for icons. Once each is in the set, the component can use it and drop its own.

| Icon | Where it's drawn now | In the line set |
|---|---|---|
| `ellipsis` | `glyphs.tsx` `Ellipsis`, for a table row's menu and folded breadcrumbs, and again in the preview's phone bar | No |
| `calendar` | `glyphs.tsx` `CalendarGlyph`, on the date pickers | Yes |
| `doc` | `FileList.tsx` `Document`, for a file with no thumbnail | No (`note` is close) |

`glyphs.tsx` also draws a checkmark, minus, plus, xmark, chevrons and a magnifying glass, which the solid set does have. The glyphs are 1.5px strokes, so they sit closer to the line set. Worth deciding which set the components draw from before swapping any of them over.

## Missing on the leads screen

| Icon | For | Stands in now |
|---|---|---|
| `line-3-horizontal` | The menu button on phones | `line-2-horizontal` from the line set |
| `line-3-horizontal-decrease` | Filters | `list-bullet-rectangle-portrait` |
| `slider-horizontal-3` | Display options for a table | `square-grid-3x3` (the line set has `slider-vertical-3`) |
| `bell` | Notifications | Dropped from the screen |
| `tray` | Inbox | `envelope` |
| `checklist` | Tasks | `checkmark-square` (the line set has `clipboard-badge-checkmark`) |
| `phone` | Calls, and logging a call | Nothing |
| `person-2` | Partners, contacts, a team | `building`, `person` |
| `chart-bar` | Reporting | Dropped from the screen (in the line set) |
| `clock` | Recent | Dropped from the screen |
| `gearshape` | Settings | Nothing |
| `trash` | Delete, in a row's menu | Nothing |
| `arrow-up-arrow-down` | Sort | A chevron (`arrow-down-arrow-up` is in the solid set) |
