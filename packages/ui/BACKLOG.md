# Backlog

What `@parchment/ui` is missing, found by building the device and favicon tools with it on 9 and 10 November 2026. The most needed come first in each list.

## Fix first

| What | Found in | Why it matters |
|---|---|---|
| Focus after a click | Device | A control clicked with the mouse keeps focus, then takes Space and the arrows: Space pressed Add device again instead of panning. Device hands those keys back to its canvas in `shortcuts.ts`. A `Toolbar` gives the controls one Tab stop, but the handing back still needs a shared way to do it |

## Foundations, next

Steve’s priority on 10 November was shadows, layered transparency for dark mode, and the palette. The roles, layers, tints, shadows and palette are in, under Done. What’s left:

- **Palette:** `highlight`, the light accent, is on no component yet, and no role uses the hues or greys.
- **Device:** its dark mode keeps mcknny’s olive for now, through its own variables.
- **Elyx:**
  - Colours, type, shadows, corners and spacing are tokens there.
  - Code layers show the light mode only, as Elyx passes them no theme, and can’t load React Aria yet.

## Components to add

Enough to work with for now (Steve, 10 November). One gap came up while moving the tools over:

| Component | Needed for | React Aria |
|---|---|---|
| Badge | Favicon’s size chips. They’re static, and a `TagGroup`’s tags are focusable, so they stay a plain list | None, a plain element |

## For the components added on 10 November

- **ColorPicker:**
  - The hex always shows in uppercase.
  - `Color` and `parseColor` aren’t exported, and a picker controlled with a hex string loses a grey’s hue, so favicon uses `defaultValue`. That only works while nothing else changes the colour.
  - A swatch-shaped trigger, for the end of a row of swatches, as device needs.
  - React Aria’s `parseColor` throws on `oklch()` and `transparent`, so device gives its fills a hex for their swatches.
  - React Aria’s colour area reads “Color picker”, and names colours such as “grayish”, in American spelling, whatever its label.
- **ColorSwatchPicker:**
  - Showing nothing chosen takes a colour that matches no swatch: device passes its custom colour, or `#fffffe`.
  - An item takes no `title` or tooltip, so device’s preset names no longer show on hover. React Aria passes `aria-label` on, but the type doesn’t allow it.
  - The chosen ring isn’t exported, so device repeats its classes on its custom-colour square.
  - Swatches are fixed at 32px. Fitting eight across device’s 288px panel took a grid and overrides.
- **DropZone:**
  - Each zone adds a Tab stop for React Aria’s hidden drop button, which makes four in favicon. An option to leave it out where a `FileTrigger` already offers a way in.
  - React Aria’s `DropEvent` isn’t exported. Export the type, or a helper that turns a drop into `File[]`, which favicon writes itself.
  - The hidden button is read out as “DropZone” before its label, which is React Aria’s.
- **GridList:**
  - A frameless tile: favicon removes the frame with `border-0 p-0 shadow-none`.
  - Selection as an outline, so hover and selected don’t fight over the border colour. Keyboard focus and selected look close on tiles.
  - Sections built from data need React Aria’s `Collection`, which isn’t exported.
- **Slider:** a thumb is named by its thumb label, then the slider’s label, as in “example-lens.svg Size”. There’s no way to make it read “Size of example-lens.svg”.
- **Others:**
  - **Tabs:** a row doesn’t scroll when it overflows on a phone, and scrolling would clip the bar.
  - **Keyboard:** in a sentence it’s only muted text, which can read as a faded word. A key-cap look may be worth trying.
  - **Toast:** React Aria’s are unstable. Ours keeps a closing toast for its exit, and slides the rest, as view transitions block clicks while they run in Chromium. Revisit when they’re stable. There’s no look yet for a toast with an action.
  - **TagGroup:** `errorMessage` only shows text, as React Aria doesn’t validate tag groups.

## For the components from before

- **NumberField:** to iterate on in time.
  - The steppers optional.
  - Dragging sideways on the label or unit changes the value, as in Figma, with the cursor showing it can.
  - A small size, and a unit or prefix inside the field, such as px or W.
  - A bigger step with Shift.
  - Steps snap to whole multiples of `step`, so device’s height, worked out from its width, never steps up.
  - An empty field sends NaN
- **Sizes for dense panels:** fields are 32px with a label above, which is tall for an inspector. The 13px trial helps
- **ToggleButton:** a small size on its own, and an icon-only shape, as icon toggles come out 40 × 28
- **Button:** a look for `isPending`, which favicon’s Export zip waits on
- **ToggleButtonGroup and Switch:** a `label` for the group and a `description` for the switch, as the fields have
- **TooltipTrigger:** a shorter default delay than React Aria’s 1.5s. A disabled button shows no tooltip
- **A warning colour:** favicon’s warnings use `text-danger`
- **Sheet:** control over how fast it opens and closes, which the browser’s smooth scroll sets today

## Questions for Steve

- Control text is on trial at 13px, and 16px on touch screens, through `--text-control` (10 November). Keep it, or try another size?
- White on the accent, `#c76024`, is 4.1:1, under the 4.5:1 AA asks of 13px text such as a button’s. `#bf5819`, a shade darker, makes 4.5:1. Keep it, or darken it?
- In the dark, the accent stays `#c76024` with dark text, at 4.4:1. The palette’s brighter `#e46f1e` would make 5.6:1 there. Worth it?
- `blush-95`, the palette’s surface, is what a raised control turns on hover. Should side panels and cards take it too, through `panel`, which is white?
- Where should `highlight` go first: the current page in a `NavigationTree`, a chosen tag, or selected text?
- The library adds about 100 kB, gzipped, to a tool. Device went from 442 to 767 kB before gzip, then 861 kB (251 kB gzipped) with the colour components. Fine for tools, and worth watching for sites

## Good to know

- In a `Select`, section ids and item ids share one set of keys. A section called phone beside a model called phone crashed device
- `light-dark()` needs Safari 17.5 or later. Older Safari can’t read it, so the roles’ colours don’t show there
- A role’s `var()` resolves on `:root`, where it’s declared, but its `light-dark()` resolves where it’s used. So `scheme-dark` on part of a page flips every role there, while `--edge`, mixed from `--bleed` on `:root`, stays the ground’s line colour inside an overlay
- Elyx paints a frame’s last shadow on top, and CSS its first, so `elevation.elyx` lists a level’s layers in the opposite order to `tokens.css`. `elyx css` keeps the order it finds, so its shadows come out upside down

## Done

- **10 November:**
  - **Components added:** `Toolbar`, `Separator`, `Keyboard`, `Tabs`, `Slider`, the colour family (`ColorPicker`, `ColorSwatchPicker`, `ColorSwatch`, `ColorArea`, `ColorSlider`, `ColorField`, `ColorThumb`), `DropZone`, `FileTrigger`, `GridList`, `TagGroup`, `SearchField` and toasts.
  - **Favicon** moved off its stand-ins onto them, with its status messages as toasts.
  - **Device** moved its toolbars, shortcuts, fill swatches and screenshot picking onto them. Space after a click still pans, through `shortcuts.ts`.
  - **Foundations:**
    - `tokens.css` has a palette and roles, and each role is a `light-dark()`, so dark mode follows the system.
    - `paper` split into `panel`, `raised`, `overlay`, `inverse` and `knob`. In the dark, panel, raised and overlay each get lighter, and a switch’s knob stays lighter than its track. `paper` is now only the marks on ink.
    - Each layer sets its own bleed, and the 13 strengths fold into 4, 8, 12, 16, 24 and 32%. The switch’s track and the swatches’ hairlines mix from `bleed`, and the sheet’s backdrop is `scrim`.
    - Shadows have their own colours, each a stack of soft drops and a 1px edge in the ground’s line colour, at three levels. `shadow-invalid` replaces the ring 7 components repeated.
    - Favicon’s dark mode is the library’s. Device keeps its olive.
    - `pnpm elyx:tokens` writes the colours, tints and shadows into the Elyx project, and `design/foundations.elyx` shows them together.
    - Type in Elyx: the sizes and leadings as tokens, with control text at 16 in the `pointer=coarse` context, the families by their desktop names, and a text component per text style. `foundations.elyx` sets its text in them, and adds a type specimen.
    - Control text sits on one 20px line, `--text-control--line-height`, at either size, in place of a 16px line for buttons and a 20px one for fields. Every 32px control pads 6px above and below, and an icon in a button or toggle sits on the line, so the padding is the same with text, an icon or both. Options and navigation links are 32px too. Elyx has the line as a multiple of the control size for each pointer, so its controls are 32px, as in code.
    - Corners and spacing are tokens. `tokens.css` sets the five corners and the spacing step under Tailwind’s names, so the classes didn’t change, and Elyx gets them in `lengths.elyx`, with a token for each of 14 spacing steps. The elevation components’ corners are bound to them, and so is everything on `foundations.elyx`, which now matches the code’s toggle track, floating toolbar, menu and navigation rows, and adds a specimen. `pnpm test` fails when a component uses a corner or step with no token.
    - Menus, selects and combo boxes pad their options 4px, in place of 6px, so the options’ 4px corners run parallel to the popover’s 8px ones.
    - The palette is Steve’s five: `cream-99` (`#fffdf8`) is the ground, `blush-95` (`#f5ebe6`) what a raised control turns on hover, `pine-26` (`#0c2920`) ink, and `rust-60` (`#c76024`) and `lime-91` (`#ceeea7`) the new `accent` and `highlight`. A solid button takes the accent, and `void` takes the ink solid had. The dark mode’s layers move from teal to pine at the same lightness, and its panel is the light mode’s ink.
    - Steve’s nine hues are in the palette, each light, mid and dark, with two greys at ten steps: `sand` for the cream ground, in the light yellow’s hue and gaining a little chroma as it darkens, and `grey` for white. The preview has a Colour page, under Foundations, which reads the palette from `tokens.css`.
- **Checkbox, Radio and Switch:** the hidden input could scroll the whole page from inside a scrolling panel. Their label is now `relative` (9 November)
