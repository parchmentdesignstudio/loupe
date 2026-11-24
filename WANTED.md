# Icons to draw

Icons that loupe needs and the solid set doesn't have yet. Most turned up building the leads screen (`#/screens/leads` in the ui preview) with nothing but loupe. Names follow the set's SF Symbols style. Where the line set already has one, it's a head start on the shape.

## Drawn by hand in loupe/ui

These are SVGs inside the components, standing in for icons. Once each is in the set, the component can use it and drop its own.

| Icon | Where it's drawn now | In the line set |
|---|---|---|
| `ellipsis` | `glyphs.tsx` `Ellipsis`, for a table row's menu and folded breadcrumbs, and again in the preview's phone bar | No, but the solid set has it now |
| `calendar` | `glyphs.tsx` `CalendarGlyph`, on the date pickers | Yes |
| `doc` | `FileList.tsx` `Document`, for a file with no thumbnail | No (`note` is close) |
| `info-circle` | `glyphs.tsx` `InfoGlyph`, for an alert’s info and neutral tones | No, but the solid set has it now |
| `checkmark-circle` | `glyphs.tsx` `SuccessGlyph`, for an alert’s success tone | No, but the solid set has it now |
| `exclamationmark-triangle` | `glyphs.tsx` `WarningGlyph`, for an alert’s warning tone | No, but the solid set has it now |
| `exclamationmark-circle` | `glyphs.tsx` `DangerGlyph`, for an alert’s danger tone | No, but the solid set has it now |

`glyphs.tsx` also draws a checkmark, minus, plus, xmark, chevrons and a magnifying glass, which the solid set does have. The glyphs are 1.5px strokes, so they sit closer to the line set. Worth deciding which set the components draw from before swapping any of them over.

## Missing on the leads screen

| Icon | For | Stands in now |
|---|---|---|
| `line-3-horizontal` | The menu button on phones | The solid set has it now. Until it's swapped in, `line-2-horizontal` from the line set |
| `line-3-horizontal-decrease` | Filters | The solid set has it now. Until it's swapped in, `list-bullet-rectangle-portrait` |
| `slider-horizontal-3` | Display options for a table | The solid set has it now. Until it's swapped in, `square-grid-3x3` |
| `bell` | Notifications | The solid set has it now. Until it's swapped in, dropped from the screen |
| `tray` | Inbox | `envelope` |
| `checklist` | Tasks | `checkmark-square` (the line set has `clipboard-badge-checkmark`) |
| `phone` | Calls, and logging a call | Nothing. A first draft didn't read as a phone, so it needs another go |
| `person-2` | Partners, contacts, a team | The solid set has it now. Until it's swapped in, `building` and `person` |
| `chart-bar` | Reporting | Dropped from the screen (in the line set) |
| `clock` | Recent | The solid set has it now. Until it's swapped in, dropped from the screen |
| `gearshape` | Settings | The solid set has it now. Nothing yet on the screen |
| `trash` | Delete, in a row's menu | The solid set has it now. Nothing yet on the screen |
| `arrow-up-arrow-down` | Sort | The solid set has it. Until it's swapped in, a chevron |

## To redraw

### Chevrons, centred by one rule

Line 16's left and right chevrons sit 1px towards their point, so they look centred. Line 24, solid 16, and every up and down chevron sit on the geometric centre instead.

- Pick one rule and draw every chevron to it in Sketch. A triangle's centroid moves a 16px chevron 1px. A circle around it moves it 2px, as the open side is the circle's diameter. Either way, it should pass the squint test.
- Use the same rule at both sizes and in both styles, with left and right as exact mirrors, and up and down as well.
- Judge up and down beside text, in a row, as they often sit beside a label and need to line up with its baseline.
