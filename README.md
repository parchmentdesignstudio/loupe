# Loupe

Parchment’s shared design library, used by mcknny, iamsteve.me and parchment. Packages, under `packages/`, are what sites install, and each is released to its own branch. Tools, under `tools/`, are what you open to make things, and they’re never released. Designs, under `design/`, are an Elyx project built on the same tokens.

| Package | What it is |
|---|---|
| `@parchment/icons` | Line and solid icons at 16 and 24px |
| `@parchment/ui` | Accessible React components, built on React Aria |

| Tool | What it does | Command |
|---|---|---|
| `tools/device` | Lays out devices and their screens, for mockups | `pnpm device` |
| `tools/favicon` | Makes the favicons, app icons and Open Graph image a site needs | `pnpm favicon` |

## Icons

### From Sketch to the library

1. Draw the icon on the solid page of the icons Sketch file as a symbol named `solid/16/name` or `solid/24/name`. Only symbols with that name pattern are exported; loose artboards and drafts are ignored.
2. In Sketch, run **Plugins › Icon › Export to Loupe** (ctrl alt shift e). It writes every solid icon to `packages/icons/source/solid/` with keylines hidden, then runs the build. No folder to choose.
3. Commit, then release (below).

Line icons aren’t in Sketch yet. `source/line/` holds iamsteve’s current line icons, styled with its Tailwind classes, which the build translates. They’ll be reworked and move to Sketch later.

A symbol name used twice is left out until one is renamed. An icon with nothing visible (usually art that ended up inside the `Keylines` group) is left out of the build with a warning.

`pnpm icons:watch` rebuilds whenever `source/` changes. Open `packages/icons/preview.html` to see every icon.

### Names

Names say what an icon draws, not what it’s for: `magnifyingglass` rather than search, `house` rather than home and `xmark` rather than close, so a name fits wherever the icon is used. The main shape comes first, then its details, then anything it sits in or carries, as in `arrow-up-right-square` or `note-text-badge-pencil`. A glyph has the same name in line and solid.

### Moving parts

A layer that should move on its own is named `part-` and what it is, in lowercase: `part-body`, `part-wheel`, `part-wave`. Layers that move as one go in a group with that name, such as `part-boat` holding `hull` and `cabin`; the Icon plugin’s Clean up keeps those groups whole. The build turns each part into a `data-part` attribute and keeps it apart from the rest of the icon, gathering layers that share a name into one group:

```css
.route:hover [data-part='body'] {
  animation: settle 0.5s ease-out;
}
```

Parts only move in an inline SVG (the components or `toSvg()`), not through a sprite’s `<use>`. A part can’t carry a `transform` of its own, as an animation would replace it, so the build warns if one does. `parts.json` lists every icon’s parts, so a re-export that drops one shows in the diff.

A part can be drawn whole and cut by a mask, such as a ferry’s hull drawn down into the water and masked at its waterline, so it can move without its cut moving with it. In Sketch, the mask is a shape set to Use as Mask, below the part, with no fill, and the layers above that shouldn’t be cut, such as the wave, break the mask chain. The build turns Sketch’s outline mask into a `clipPath`, which ignores the icon’s colour, and puts it on a group around the part, so the clip stays put while the part slides or rocks through it. Each clip’s id starts with the icon’s name, so two icons never share one, but an icon shown twice on a page repeats its id. That’s harmless unless the first copy is hidden with `display: none`, where some browsers drop the clip, so a site that hides some copies gives each its own id.

### What the build makes

| Output | Use |
|---|---|
| `svg/<variant>/<size>/<name>.svg` | Clean files for anything that takes an SVG |
| `sprite/<variant>-<size>.svg` | One sprite per set, for `<use href="sprite/line-16.svg#house">` |
| `lib/astro/Icon.astro` | Astro component |
| `lib/react/index.js` | React component |
| `lib/index.js` | `toSvg()`, `resolveIcon()` and `iconNames()` for anything else |
| `icons.json` | Every name, by variant and size |
| `parts.json` | The moving parts each icon names, for animation |

Icons draw in `currentColor`. Knock-out shapes use `--icon-fill`, the page background (`Canvas`) unless a site sets it, so set `color-scheme` for dark mode (`none` turns it off). A few line icons use `--icon-fill-bg`, a tint of the icon’s colour. The success icons fill with `--icon-success`, falling back to `--icon-fill`.

### Using it in a site

```sh
pnpm add github:parchmentdesignstudio/loupe#icons
npm install github:parchmentdesignstudio/loupe#icons
```

```astro
---
import Icon from '@parchment/icons/astro'
---
<Icon name="house" />
<Icon name="magnifyingglass" label="Search" />
<Icon name="calendar-blank" variant="line" size={24} />
```

```jsx
import { Icon } from '@parchment/icons/react'

<Icon name="house" className="text-olive" />
```

Icons are solid and 16px by default. `size` picks the drawn set, 16 or 24, and the icon renders at exactly that size: nothing is scaled, so asking for an icon that isn’t drawn at that size is an error. Without `label` the icon is hidden from screen readers.

## UI

React components built on React Aria, so keyboard use, focus, labels and screen readers work the same in every site. Each is styled with Tailwind classes, composed through tailwind-variants.

| Component | What it’s for |
|---|---|
| `Button` | Any action, as solid, plain or quiet, and a circle for an icon |
| `Chip`, `ChipGroup` | Suggestions to tap |
| `Toolbar` | Controls in a row, such as an editor’s tools: one Tab stop, with the arrow keys between them |
| `Separator` | A line between groups of controls, or sections of a panel. In a toolbar it stands upright |
| `Keyboard` | A keyboard shortcut, such as ⌘Z, in a sentence, a tooltip, or at the end of a menu item |
| `Composer` | A message field with its send button |
| `TextField` | Text, or several lines with `multiline` |
| `NumberField` | A number, typed or stepped with the arrow keys and its buttons, within its limits |
| `SearchField` | Searching, with a button that clears what’s typed. Escape clears it too |
| `Slider` | A number between two limits, dragged or moved with the arrow keys, with its value beside the label. Two values make a range, with a thumb for each |
| `Checkbox`, `CheckboxGroup` | Ticking any number of options |
| `RadioGroup`, `Radio` | Choosing one option |
| `Switch` | A setting that takes effect straight away |
| `ToggleButtonGroup`, `ToggleButton` | A segmented control: a few options side by side, with a fill that slides to the chosen one |
| `Select` | Choosing one option from a list that opens |
| `ComboBox` | Typing to filter a list of options |
| `ListBoxItem`, `ListBoxSection` | The options in a select or combo box, optionally grouped in sections |
| `Header` | A section’s heading, first inside a `ListBoxSection` or `MenuSection` |
| `ColorPicker` | A colour, shown as a swatch and its hex in a button like a field’s, that opens a colour area, a hue slider and a hex field |
| `ColorSwatchPicker`, `ColorSwatchPickerItem` | A colour picked from a few set ones, as a row of swatches |
| `ColorSwatch` | A colour on its own, over a checkerboard that shows through where it’s see-through |
| `ColorArea`, `ColorSlider`, `ColorField` | A colour picker’s parts, to make your own: two channels at once on an area, one along a track, and the hex typed in |
| `GridList`, `GridListItem` | Items to choose or act on, as rows or as tiles, which can hold buttons of their own. `GridListSection` and `GridListHeader` group them under headings, and choosing several shows a checkbox in each |
| `TagGroup`, `Tag` | Short labels to choose from or remove, such as sizes or filters, under a label like a field’s |
| `DropZone` | Somewhere to drop files, or paste them: dashed, or quiet for a panel or canvas, which shows an outline only while files are over it |
| `FileTrigger` | Opens the file picker from the button inside it |
| `Modal`, `Dialog`, `DialogTrigger` | A dialog over the page, with `DialogHeading`, `DialogActions` and `DialogClose` |
| `Sheet`, `SheetTrigger` | A panel that slides in from an edge of the screen, and swipes back out |
| `Popover` | A dialog beside what opened it |
| `Menu`, `MenuTrigger` | Actions in a list that opens, with `MenuItem`, `MenuSection` and `MenuSeparator` |
| `Tooltip`, `TooltipTrigger` | A short label for a control, on hover and keyboard focus |
| `ToastQueue`, `ToastRegion`, `Toast` | Short messages at the bottom of the screen, such as an export finishing, that close themselves after 5 seconds. An app adds them to one queue, which one region shows. React Aria’s toasts are still unstable, so these may change |
| `Navigation` | A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones |
| `Link` | A link to another page, or a place on this one |
| `NavigationTree` | Links to the pages of a site or tool, in sections, with the current page marked, through `NavigationTreeSection`, `NavigationTreeHeader`, `NavigationTreeItem` and `NavigationTreeItemContent` |
| `Disclosure`, `DisclosureGroup` | A heading that shows or hides what’s under it, through `DisclosureHeader` and `DisclosurePanel`: medium for questions and answers, small for navigation or a title over its description |
| `Tabs` | Panels shown one at a time, picked from a `TabList` of `Tab`s, in a row or a column, with a bar that slides to the chosen one. A `TabPanel` shares its tab’s id, and a tab with an `href` is a link |

Fields share a `Label`, `Description` and `FieldError`, and each takes `label`, `description` and `errorMessage`. Overlays come and go with the `animate-enter` and `animate-exit` keyframes in `tokens.css`, and fade instead when reduced motion is on. Popovers and tooltips have no arrow unless you pass `showArrow`.

`FileTrigger` and `isFileDropItem` are React Aria’s own, passed through as they are. Wrap a `Button` in `FileTrigger` to open the file picker, and pick the files out of a `DropZone`’s drop with `isFileDropItem`.

Buttons, chips and fields have no set height. Control text sits on a 20px line, and the padding adds to it: 6px above and below makes a button, field, option or tab 32px tall, and 4px makes a small button 28px. An icon in a button or toggle sits on the line, as text does, so the padding is the same whether a control holds text, an icon or both. Text sits 12px in from the sides, or 10px on a small button, and an icon at the end, such as a select’s chevron, sits 8px in, as a circle button’s does. A select is a button, so its text is medium, as a button’s is. Corners are 8px, except on modals and sheets, and on things round by nature, such as circle buttons, radios and switches.

What the library is still missing is in `packages/ui/BACKLOG.md`, found by building the device and favicon tools with it.

A dialog or sheet with a field puts focus in the first one: give it `autoFocus`, as React Aria’s own examples do. Lint allows `autoFocus` on the package’s components, but not on plain HTML elements.

### Colours and elevation

Dark mode follows the system, with no toggle. Each colour is a role set with `light-dark()`, so the tokens alone give a site both modes. To keep a site light, set `color-scheme: light` on `:root`, and `scheme-light` or `scheme-dark` sets one for part of a page. `light-dark()` needs Safari 17.5 or later.

`tokens.css` has two tiers. The palette holds the raw colours, named by hue and lightness, so `teal-29` is `oklch(0.29 …)`. The roles are what components use, and each points at one palette colour in the light and another in the dark.

| Role | What it’s for |
|---|---|
| `ink`, `muted` | Text, and quieter text |
| `danger` | Errors, and the ring on a field whose value is wrong |
| `paper` | Marks on ink, such as a solid button’s text or a checkbox’s tick |
| `ground` | The page |
| `panel` | An area on the page, such as a tool’s side panel |
| `raised` | A control’s fill, such as a button’s, a field’s or a checkbox’s, which turns `surface` on hover |
| `overlay` | Popovers, menus, dialogs, sheets and floating toolbars |
| `inverse` | Ink as a surface, such as a toast or a tooltip, with paper text |
| `knob` | A switch’s handle when it’s off, and a slider’s thumb, so they stay lighter than their track |
| `scrim` | Behind a sheet |

The layers go from the page up: ground, panel, raised and overlay. In the light, panel, raised and overlay are all white, and shadows part them. In the dark, each is lighter than the one below.

Hover, pressed and current states, and the lines between things, use `bleed` at 4, 8, 12, 16, 24 or 32%, such as `bg-bleed/8`. Each layer sets the bleed its tints mix from, so a tint suits what it sits on: see-through ink would grey the cream ground, so there it’s ink in the ground’s hue. A new surface that holds states or lines sets its own, as an overlay does with `bg-overlay [--bleed:var(--overlay-bleed)]`. Elyx has a tint for each strength, so `pnpm test` fails on any other.

| Shadow | What it’s for |
|---|---|
| `shadow-raised` | Buttons, chips and fields |
| `shadow-floating` | Floating toolbars |
| `shadow-overlay` | Popovers, menus, dialogs and sheets |
| `shadow-invalid` | A field whose value is wrong, in place of its shadow |

The raised, floating and overlay shadows are each a 1px edge and a stack of soft drops, deeper and darker at each level. They have colours of their own, so they stay dark in the dark.

### Using it in a site

```sh
pnpm add github:parchmentdesignstudio/loupe#ui
```

The site needs React 19, and for Astro, `@astrojs/react`. Import the tokens after Tailwind. They add the utilities the components use, such as `bg-ink`, `text-body` and `shadow-raised`, and point Tailwind at the package’s classes.

```css
@import 'tailwindcss';
@import '@parchment/ui/tokens.css';
```

```jsx
import { Button, Chip, ChipGroup } from '@parchment/ui'

<Button onPress={schedule}>Schedule call</Button>
<Button variant="plain" shape="circle" aria-label="Email Steve"><Icon name="envelope" /></Button>
<ChipGroup aria-label="Or start with">
  <Chip onPress={start}>A new website</Chip>
</ChipGroup>
```

To change a token, set its variable on `:root`, such as `--text-size`. A colour takes both modes, as in `--ink: light-dark(var(--teal-25), var(--cream-98))`, or one value for both. The type is Elza Round Variable, with Auger Mono for small labels, both from Adobe Fonts: load a kit with both, or set `--face` and `--mono` to your own.

### Writing a component

A component takes the name and props of the React Aria component it wraps: React Aria’s `Link` is our `Link`, and its `NavigationTree` is ours, down to `NavigationTreeItemContent`. React Aria is the primitive, and the package adds Parchment’s styling. Where React Aria has nothing, use the HTML element’s name.

Wrap the React Aria component and style it with a `tv()` recipe. Name the variants after React Aria’s render props (`isHovered`, `isPressed`, `isFocusVisible`, `isDisabled`), so each state’s classes live in the recipe rather than in conditions. `composeRenderProps` hands React Aria’s state to the recipe, and keeps a `className` prop working, as a string or a function.

```tsx
export const chip = tv({
  extend: focusRing,
  base: 'rounded-lg bg-raised px-3 py-1.5 text-control shadow-raised',
  variants: {
    isPressed: { true: 'scale-97' },
    isDisabled: { true: 'opacity-40' },
  },
})

export function Chip(props: ChipProps) {
  return <AriaButton {...props} className={composeRenderProps(props.className, (className, state) => chip({ ...state, className }))} />
}
```

Import `tv` from `src/tv.ts` rather than tailwind-variants itself. It teaches the merge the tokens’ names, so `text-body` (a size) and `text-ink` (a colour) don’t cancel each other out. Text in a control, from a button’s to a field’s and its label, is `text-control`: 13px with a mouse or trackpad, and 16px on a touch screen, where iOS zooms into a field with smaller text. Change `--control-size` to change it everywhere. It sits on `--control-leading`, a fixed 20px rather than a multiple, so a control keeps its height at either size. A 16px line, to match an icon, would be too tight for 16px text, and Chrome ignores a field’s line when it’s no taller than the text. Instead, a control that can hold just an icon gives the icon the line’s height, as `Button` and `ToggleButton` do with `[&>svg]:my-[calc((1lh-1rem)/2)]`.

### Checks

| Command | What it does |
|---|---|
| `pnpm ui` | The preview page, every component in its states, at localhost:5199 |
| `pnpm test` | Vitest across the workspace, with an axe check for each component, then a check that the Elyx tokens match `tokens.css` |
| `pnpm lint` | oxlint, with the accessibility rules on. The icons package and device aren’t linted yet |
| `pnpm --filter @parchment/ui build` | Builds `lib`, which is committed so releases can install it |

## Elyx

`design/` is the Elyx project, with `packages/ui` and `packages/icons` as its dependencies. `foundations.elyx` shows the colour roles, elevation, type, corners and spacing together, as the components use them: switch the theme to see them in the dark, and the pointer to coarse to see control text as it is on a touch screen.

Its colours, type, corners, spacing and shadows are written from `packages/ui/tokens.css`, so change the CSS, then run:

```sh
pnpm elyx:tokens
```

That writes the tokens in `design/tokens` (`colors.elyx`, `colors-dark.elyx`, `typography.elyx`, `typography-coarse.elyx`, `lengths.elyx` and `fonts.elyx`) and the components in `design/components` (`elevation.elyx` and `text.elyx`). Don’t edit them by hand, as `pnpm test` fails when they don’t match the CSS.

`colors` holds the palette, in hex, and the roles. `colors-dark.elyx` gives every role its dark value, in the `theme=dark` context, even a role that only names another, such as `inverse`, as Elyx would keep its light value. Elyx can’t mix a colour by the theme, so each tint is a token of its own in `tints`, named for its layer and strength: `tints.overlay-8` is `bg-bleed/8` on an overlay. Its tokens can’t hold a shadow either, so each level is a component in `elevation.elyx`, with the fill it goes with and its corners from `lengths`. Instance one, then give it a size and contents. CSS paints a shadow’s first layer on top and Elyx its last, so a level’s layers are in the opposite order to `tokens.css`.

`typography` holds each text style’s size, in points, and its leading, as a multiple of the size, and `typography-coarse.elyx` gives control text its touch-screen 16 in the `pointer=coarse` context. `fonts` names the families as the desktop does, so Elyx draws Elza Round Variable and Auger Mono once they’re activated in Adobe Fonts. Each text style is a text layer in `text.elyx`: instance `body`, `control`, `label` or `title`, then set its contents. Weights aren’t tokens, so set `font-style: "Medium"` where a component does: each style’s caption says where. A new text style needs a caption, and a new family its desktop name, in `scripts/elyx-tokens.mjs`. The script stops and says which.

`control-leading` is 20px in the CSS, but Elyx takes leading only as a multiple of the size, so there it’s a multiple of `control-size`: 1.54, and 1.25 in the `pointer=coarse` context, which Elyx draws as 20px either way. So `control` text with 6px padding above and below comes out 32px tall, as in code.

`lengths` holds the corners and spacing, in pixels, under Tailwind’s names: `radius-lg` is `rounded-lg`, and `spacing-3` is `p-3` or `gap-3`. A half step takes a dash, so `spacing-1-5` is `p-1.5`. `tokens.css` sets them in an `@theme` block of their own, so the components’ classes didn’t change. Tailwind spaces by any multiple of `--spacing`, but Elyx needs a token for each step, so it gets the 14 that `tokens.css` lists, from 2px to 64px. `pnpm test` fails when a component rounds to a corner or spaces by a step that has no token.

`packages/ui/elyx/README.md` covers placing the components themselves, as code layers.

## Releasing

Each package is published to its own branch, so npm and pnpm can both install it from GitHub.

```sh
pnpm release icons
```

This builds, checks everything is committed, pushes `packages/icons` to the `icons` branch and tags it `icons@<version>`. Bump the version in `packages/icons/package.json` first, then sites can pin with `#icons@0.2.0` or follow `#icons`. The UI package releases the same way, with `pnpm release ui`.

## Device

`pnpm device` opens the canvas at localhost:5190, for laying out devices and their screens. Its icons come straight from `packages/icons`, so a new one shows there as soon as it’s built, before it’s released. `tools/device/README.md` covers using it.

## Favicon

`pnpm favicon` opens the tool. It runs in the browser, so nothing is uploaded.

Drop in artwork and every output is drawn on one canvas: the favicon at 16, 32 and 48, the Apple touch icon, the manifest icons, a maskable icon, the Open Graph image and the iOS icon in light, dark and tinted. Select one to change its padding, background or artwork, or save it on its own. Export zip gives you every file, the manifest, the HTML for the `<head>` and an Icon Composer file.

### Sizes

Each piece of artwork has the size it was drawn at, read from the SVG or image. Every output uses the artwork drawn closest above its own size, so a single large SVG fills everything, and a simplified drawing at 16px takes over the 16px favicon without touching the rest. Change the size on a piece of artwork to move where it applies. A PNG smaller than an output it’s used for is flagged on the canvas.

### iOS

The iOS layers go into `ios/AppIcon.icon`, which opens in Icon Composer and drops into Xcode. List them front first, up to four, each drawn on the same 1024 canvas, and each becomes its own group so it sits at its own depth. Without layers, the main artwork is used as one. Apple doesn’t document the `.icon` format, so the file follows what Icon Composer saves; open it there to set the glass, shadows and appearances before shipping. The flat light, dark and tinted PNGs are previews of those appearances, for older systems.

`reference.html` lists every size by platform and ticks off what your last export included.
