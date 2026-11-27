# Icons to draw

Icons that loupe needs and the solid set doesn't have yet. Most turned up building the leads screen (`#/screens/leads` in the ui preview) with nothing but loupe. Names follow the set's SF Symbols style. Where the line set already has one, it's a head start on the shape.

## Drawn by hand in loupe/ui

These are SVGs inside the components, standing in for icons. Once each is in the set, the component can use it and drop its own.

| Icon | Where it's drawn now | In the line set |
|---|---|---|
| `ellipsis` | `glyphs.tsx` `Ellipsis`, for a table row's menu and folded breadcrumbs, and again in the preview's phone bar | No, but the solid set has it now |
| `calendar` | `glyphs.tsx` `CalendarGlyph`, on the date pickers | Yes |
| `doc` | `FileList.tsx` `Document`, for a file with no thumbnail | No, but the solid set has it now |
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
| `tray` | Inbox | The solid set has it now. Until it's swapped in, `envelope` |
| `checklist` | Tasks | The solid set has it now. Until it's swapped in, `checkmark-square` |
| `phone` | Calls, and logging a call | The solid set has it now. Nothing yet on the screen |
| `person-2` | Partners, contacts, a team | The solid set has it now. Until it's swapped in, `building` and `person` |
| `chart-bar` | Reporting | The solid set has it now. Until it's swapped in, dropped from the screen |
| `clock` | Recent | The solid set has it now. Until it's swapped in, dropped from the screen |
| `gearshape` | Settings | The solid set has it now. Nothing yet on the screen |
| `trash` | Delete, in a row's menu | The solid set has it now. Nothing yet on the screen |
| `arrow-up-arrow-down` | Sort | The solid set has it. Until it's swapped in, a chevron |

## For iamsteve.me

The site is moving to the solid set at 16px. These were drawn for it, from the line set where it had them:

| Site | Solid |
|---|---|
| `code` | `terminal` |
| `css` | `curlybraces` |
| `views` | `chart-bar` |
| `publication` | `newspaper` |
| `website` | `macwindow` |
| `foundry` | `character-textbox`, new to the set |
| `calendar`, `folder`, `bolt`, `bookmark`, `bee` | Same names |
| `puzzle`, `bulb` | `puzzlepiece`, `lightbulb` |
| `square-info` | `info-square` |
| `clock-reverse` | `clock-arrow-circlepath` |
| `book` | `book-closed` |
| `external` | `arrow-up-right-square`, the square family's arrow turned to the corner, new to the solid set's Arrows artboard |

`collections` is two books, and `books-vertical` has three. `navigation` is two lines, and `line-3-horizontal` has three. Both are close enough to swap in, unless the site wants the exact shape.

Every other line icon has a solid now too, so the site can swap any of them. `category`, `design`, `blog` and `font-outline` are gone from both sets, as they drew the same thing as `folder`, `pencil-tip` (the pen tool) and `font`. Their old names are search terms on those icons now. `shapes` is finished too, from the draft in Sketch, so the line set has no gaps left. Other bee options sit on the Bee options artboard, for a later pass: `p1` and `r2` came closest to the shipped one.

The site's categories had four gaps, which are drawn now:

| Category | Solid |
|---|---|
| JavaScript | `js-square`, with the letters set in Elza Round |
| Animation | `point-bottomleft-forward-to-point-topright-scurvepath`, an easing curve |
| Prototyping | `cursorarrow-rays` |
| Code | `chevron-left-forwardslash-chevron-right`, which leaves `terminal` for Terminal |

`star-square` is the only icon in the site's sprites without a solid. The site doesn't use it, and its slot in Sketch is empty.

## For mcknny

mcknny draws some icons from Lucide. These were the ones with no solid to swap to, and all are drawn now:

| Lucide | Solid |
|---|---|
| `ChartLine` | `chart-line-uptrend-xyaxis` |
| `Cloud`, `Wifi`, `Globe` | `cloud`, `wifi`, `globe` |
| `Fingerprint` | `touchid` |
| `BrushCleaning` | `paintbrush` |
| `Luggage` | `suitcase-rolling` |
| `Megaphone` | `megaphone` |
| `Blend` | `circle-on-circle` |
| `Binoculars` | `binoculars` |
| `SquareDashedText` | `text-viewfinder` |
| `CodeXml` | `chevron-left-forwardslash-chevron-right` |

The site hasn't been moved over to them yet.

## Weather

A first set of 16 sits on the Weather artboard: `cloud-sun`, `cloud-moon`, `cloud-rain`, `cloud-heavyrain`, `cloud-bolt`, `cloud-snow`, `cloud-hail`, `cloud-fog`, `wind`, `tornado`, `snowflake`, `drop`, `umbrella`, `thermometer-medium`, `sunrise` and `sunset`. `cloud-snow` and `cloud-hail` are close at 16px, so one of them needs a different idea.

## Options kept in Sketch

Drawings that weren't chosen stay on their own artboards, for later: Bee options, Car options (nine car concepts, none shipped yet) and Globe options (the outline globe from before the cut-out one).

## To redraw

### Inner shapes, from the building blocks

Hands, prompts, bars and other shapes inside an icon should start from the Building blocks artboard: 1.5px bars with 0.5 corners, and angles with a 0.5 outer corner and a sharp inner one, rather than fully rounded ends. `clock`, `clock-arrow-circlepath`, `terminal`, `info-square`, `curlybraces` and the four status icons (`checkmark-circle`, `exclamationmark-circle`, `exclamationmark-triangle`, `info-circle`) are drawn that way now. Many older icons still round their ends fully, so the rest of the set needs a pass.

### Chevrons, centred by one rule

Line 16's left and right chevrons sit 1px towards their point, so they look centred. Line 24, solid 16, and every up and down chevron sit on the geometric centre instead.

- Pick one rule and draw every chevron to it in Sketch. A triangle's centroid moves a 16px chevron 1px. A circle around it moves it 2px, as the open side is the circle's diameter. Either way, it should pass the squint test.
- Use the same rule at both sizes and in both styles, with left and right as exact mirrors, and up and down as well.
- Judge up and down beside text, in a row, as they often sit beside a label and need to line up with its baseline.
