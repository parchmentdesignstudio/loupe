# Loupe

Parchment’s shared design library, used by mcknny, iamsteve.me and parchment. Packages, under `packages/`, are what sites install, and each is released to its own branch. Tools, under `tools/`, are what you open to make things, and they’re never released. Designs, under `design/`, are an Elyx project built on the same tokens. Templates will sit under `templates/`.

| Package | What it is |
|---|---|
| `@parchment/tokens` | Colour, type, spacing, radius, shadow and motion (planned) |
| `@parchment/icons` | Line and solid icons at 16 and 24px |
| `@parchment/ui` | Accessible React components, built on React Aria |
| `@parchment/logos` | Company logos, with versions drawn for 16px where a company’s own doesn’t hold up |
| `@parchment/compose` | Rearranges a page’s layout in the browser, on its own CSS grid, and hands the changes to whoever writes the source |

| Tool | What it does | Command |
|---|---|---|
| `tools/device` | Lays out devices and their screens, for mockups | `pnpm device` |
| `tools/favicon` | Makes the favicons, app icons and Open Graph image a site needs | `pnpm favicon` |

## Tokens

Planned. The primitives every other part draws from: colour, type, spacing, radius, shadow and motion. They’ll live in `packages/tokens` as plain CSS variables with a Tailwind `@theme` file over them, so an Astro site or a tool can use them without React. `@parchment/ui` will import them rather than define its own, and the tokens now in `packages/ui/tokens.css` move across.

## Templates

Planned. Whole pages and sections, such as an article, a landing page or a pricing table, built from the components. Each one is a folder under `templates/`, so it can depend on `@parchment/ui` and change at its own pace without a release of the components.

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
| `lib/index.js` | `toSvg()`, `resolveIcon()` and `iconNames()` for anything else, and `matchesIcon()` to search icons by name or what they're for |
| `icons.json` | Every name, by variant and size |
| `parts.json` | The moving parts each icon names, for animation |
| `terms.js` | What each icon's for, by hand, such as copy for `square-on-square`. Add a new icon's here when its name says what it looks like |

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
| `Button` | Any action, as primary in marigold, secondary in white, quiet in slate, outline or ghost, with an icon at either end, and a circle for an icon |
| `Chip`, `ChipGroup` | Suggestions to tap |
| `Toolbar` | Controls in a row, such as an editor’s tools: one Tab stop, with the arrow keys between them |
| `Separator` | A line between groups of controls, or sections of a panel. In a toolbar it stands upright |
| `Code` | A block of code, highlighted by Shiki, with a title, Copy and line numbers, in Loupe's, iamsteve's or mcknny's colours |
| `Keyboard` | A keyboard shortcut, such as ⌘Z, in a sentence, a tooltip, or at the end of a menu item |
| `Prose` | Writing at length as plain HTML, such as a post from Markdown or a CMS, set in Loupe’s type with no classes inside. Without React, put the `prose` class from `tokens.css` on what holds it |
| `Quote` | Someone else’s words in Livory’s italic, centred under an opening mark, with who said it under them, as a figure. It shares prose’s blockquote rules, through the `quote` class in `styles/prose.css`. `variant="testimonial"` sets them from the start edge, with the person’s photo beside their name |
| `Aside` | The writer’s own voice beside the main text: a signpost to what’s coming or what the reader needs first, behind the accent’s rule, or an afterthought in muted italic. In prose the rule hangs in the margin |
| `Composer` | A message field with its send button |
| `TextField` | Text, or several lines with `isMultiline`. `start` puts an icon before the value, as it does on `NumberField` and `Select`, for a field in a panel with no label to see |
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
| `Swatch` | Any CSS colour or token as a square, small in a line of text, medium in a list or large on its own |
| `ColorArea`, `ColorSlider`, `ColorField` | A colour picker’s parts, to make your own: two channels at once on an area, one along a track, and the hex typed in |
| `GridList`, `GridListItem` | Items to choose or act on, as rows or as tiles, which can hold buttons of their own. `GridListSection` and `GridListHeader` group them under headings, and choosing several shows a checkbox in each |
| `TagGroup`, `Tag` | Short labels to choose from or remove, such as sizes or filters, under a label like a field’s |
| `DropZone` | Somewhere to drop files, or paste them: dashed, or quiet for a panel or canvas, which shows an outline only while files are over it |
| `FileTrigger` | Opens the file picker from the button inside it |
| `Modal`, `Dialog`, `DialogTrigger` | A dialog over the page, with `DialogHeading`, `DialogActions` and `DialogClose` |
| `Drawer`, `DrawerTrigger` | A panel that slides in from an edge of the screen, and swipes back out |
| `Popover` | A dialog beside what opened it |
| `Menu`, `MenuTrigger` | Actions in a list that opens, with `MenuItem`, `MenuSection` and `MenuSeparator` |
| `Tooltip`, `TooltipTrigger` | A short label for a control, on hover and keyboard focus |
| `Alert` | Something to know about a page or part of it, in Status’s tones: an alert tinted to draw the eye, or a quieter notice in the flow, with a title, actions and a dismiss button if it needs them. It isn’t announced: give one that appears later `role="alert"` or `role="status"` |
| `ToastQueue`, `ToastRegion`, `Toast` | Short messages at the bottom of the screen, such as an export finishing, that close themselves after 5 seconds. An app adds them to one queue, which one region shows. React Aria’s toasts are still unstable, so these may change |
| `Navigation` | A page’s navigation: a column beside the page on wider screens, and a drawer behind a button on phones |
| `Link` | A link to another page, or a place on this one |
| `NavigationTree` | Links to the pages of a site or tool, in sections, with the current page marked, through `NavigationTreeSection`, `NavigationTreeHeader`, `NavigationTreeItem` and `NavigationTreeItemContent` |
| `Disclosure`, `DisclosureGroup` | A heading that shows or hides what’s under it, through `DisclosureHeader` and `DisclosurePanel`: medium for questions and answers, small for navigation or a title over its description |
| `Tabs` | Panels shown one at a time, picked from a `TabList` of `Tab`s, in a row or a column, with a bar that slides to the chosen one. A `TabPanel` shares its tab’s id, and a tab with an `href` is a link |

Fields share a `Label`, `Description` and `FieldError`, and each takes `label`, `description` and `errorMessage`. Overlays come and go with the `animate-enter` and `animate-exit` keyframes in `styles/theme.css`, and fade instead when reduced motion is on. Popovers and tooltips have no arrow unless you pass `showArrow`.

`FileTrigger` and `isFileDropItem` are React Aria’s own, passed through as they are. Wrap a `Button` in `FileTrigger` to open the file picker, and pick the files out of a `DropZone`’s drop with `isFileDropItem`.

Buttons, chips and fields have no set height. Control text sits on a 20px line, and the padding adds to it: 6px above and below makes a button, field, option or tab 32px tall, and 4px makes a small button 28px. An icon in a button or toggle sits on the line, as text does, so the padding is the same whether a control holds text, an icon or both. Text sits 12px in from the sides, or 10px on a small button, and an icon at the end, such as a select’s chevron, sits 8px in, as a circle button’s does. A select is a button, so its text is medium, as a button’s is. Corners are 8px, except on modals and drawers, and on things round by nature, such as circle buttons, radios and switches.

What the library is still missing is in `packages/ui/BACKLOG.md`, found by building the device and favicon tools with it.

A dialog or drawer with a field puts focus in the first one: give it `autoFocus`, as React Aria’s own examples do. Lint allows `autoFocus` on the package’s components, but not on plain HTML elements.

### Where the styles live

A site imports `tokens.css`, which only gathers four files in `styles`, each with one job:

| File | What goes in it |
|---|---|
| `theme.css` | The values everything is built from, and only values: the palette, roles, bleed, shadows, type, corners, spacing and motion |
| `code-themes.css` | Code coloured as another of Parchment’s sites colours it, with `data-code-theme` |
| `prose.css` | Styles for HTML no component renders, through the `prose` and `quote` classes. The only file with rules for elements |
| `components.css` | Each component’s own tokens, such as `--button-radius`, in the sidebar’s order. Each starts at a value from `theme.css`, so a value the theme lacks goes there first. A colour is listed but left unset, and read with that value as its fallback, so it follows a section that re-sets the roles |

### Colours and elevation

Dark mode follows the system, with no toggle. Each colour is a role set with `light-dark()`, so the tokens alone give a site both modes. To keep a site light, set `color-scheme: light` on `:root`, and `scheme-light` or `scheme-dark` sets one for part of a page. `light-dark()` needs Safari 17.5 or later.

`styles/theme.css` has two tiers. The palette holds the raw colours, named by hue and lightness, so `pine-26` is `oklch(0.26 …)`, and the further apart two numbers, the stronger the contrast. Parchment’s own five are `cream-99`, `blush-95`, `pine-26`, `rust-60` and `lime-91`, and the roles work out the rest of their colours from them. The roles are what components use, and each points at one palette colour in the light and another in the dark.

The palette also has nine hues, `red`, `orange`, `yellow`, `green`, `teal`, `sky`, `blue`, `violet` and `pink`, each light, mid and dark, such as `teal-88`, `teal-69` and `teal-48`. Two greys come at the same ten steps, from 97 to 26: `sand` for the cream ground, in the light yellow’s hue, warming a little as it darkens, and `grey`, a neutral one for white. On the layer each is for, 56 and darker pass 4.5:1 for text, and 66 and darker 3:1 for a control’s edge. No role uses them yet, so take one as it is, as in `var(--sand-56)`. The preview’s Colour page shows the whole palette.

| Role | What it’s for |
|---|---|
| `ink`, `muted` | Text, and quieter text |
| `danger` | Errors, and the ring on a field whose value is wrong |
| `paper` | Marks on ink, such as a button’s text or a checkbox’s tick |
| `accent` | What a page leads with, and what marks the current page or today. Marigold, as a primary button is, in both themes |
| `highlight` | The light accent, a fill behind ink to mark something out |
| `ground` | The page |
| `panel` | An area on the page, such as a tool’s side panel |
| `raised` | A control’s fill, such as a button’s, a field’s or a checkbox’s, which turns `surface` on hover |
| `overlay` | Popovers, menus, dialogs, drawers and floating toolbars |
| `inverse` | Ink as a surface, such as a toast or a tooltip, with paper text |
| `knob` | A switch’s handle when it’s off, and a slider’s thumb, so they stay lighter than their track |
| `scrim` | Behind a drawer |

The layers go from the page up: ground, panel, raised and overlay. In the light, panel, raised and overlay are all white, and shadows part them. In the dark, each is lighter than the one below.

Hover, pressed and current states, and the lines between things, use `bleed` at 4, 8, 12, 16, 24 or 32%, such as `bg-bleed/8`. Each layer sets the bleed its tints mix from, so a tint suits what it sits on: see-through ink would grey the cream ground, so there it’s ink in the ground’s hue. A new surface that holds states or lines sets its own, as an overlay does with `bg-overlay [--bleed:var(--overlay-bleed)]`. Elyx has a tint for each strength, so `pnpm test` fails on any other.

| Shadow | What it’s for |
|---|---|
| `shadow-raised` | Buttons, chips and fields |
| `shadow-floating` | Floating toolbars |
| `shadow-overlay` | Popovers, menus, dialogs and drawers |
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
<Button variant="ghost" shape="full" aria-label="Email Steve"><Icon name="envelope" /></Button>
<ChipGroup aria-label="Or start with">
  <Chip onPress={start}>A new website</Chip>
</ChipGroup>
```

Each token is one of Tailwind’s own variables, set once in `styles/theme.css`, so `--color-ink` is `bg-ink` and `text-ink`, and `--text-label` is `text-label`. To change one, set its variable on `:root`, such as `--text-body`. A colour takes both modes, as in `--color-ink: light-dark(var(--color-pine-20), var(--color-cream-99))`, or one value for both. The type is Elza Round Variable, with Auger Mono for small labels, both from Adobe Fonts: load a kit with both, or set `--font-sans` and `--font-mono` to your own.

### Code

`Code` shows code Shiki has highlighted with Loupe's theme. Everything for Shiki is in `@parchment/ui/shiki`, so a site that doesn't highlight never loads it, and Shiki itself, with its transformers, is installed by the site (`pnpm add shiki @shikijs/transformers`). The entry needs both, even for the theme alone. In the browser, `useHighlight` loads Shiki, with its JavaScript engine rather than WebAssembly, and each language's grammar the first time it's needed:

```jsx
import { Code } from '@parchment/ui'
import { useHighlight } from '@parchment/ui/shiki'

const html = useHighlight(source, { language: 'tsx', lineNumbers: true })
<Code code={source} html={html} title="src/Toolbar.tsx" copyIcon={<Icon name="square-on-square" />} copiedIcon={<Icon name="checkmark" />} />
```

The title sits on a bar above the code, as an editor's tab does. A path shows its folders quieter than its file, and a diff shows how many lines it removes and adds beside it. Copy is the word unless it's given `copyIcon`, and then an icon with its name in a tooltip, swapped for `copiedIcon` once it's copied. Without a title, Copy floats in the corner.

A site that highlights as it builds, such as with `@shikijs/rehype`, passes Loupe's theme and transformers to its own Shiki instead:

```js
import { codeTheme, codeTransformers } from '@parchment/ui/shiki'

[rehypeShiki, { theme: codeTheme, transformers: codeTransformers() }]
```

Lines can be marked out, and `Code` styles each mark. `{6-8}` in a fence's meta highlights lines 6 to 8, and `/gap/` a word. In the code, a comment ending a line marks it: `// [!code highlight]`, `[!code ++]` and `[!code --]` for a diff, `[!code focus]` to fade the rest until the block's hovered, and `[!code error]` or `[!code warning]`. Copy leaves the notes out. In the browser, pass the meta as `useHighlight(source, { meta: '{6-8}' })`. The marks come from `@shikijs/transformers`.

The theme names roles, not colours: `--color-code-keyword`, `-string`, `-quote`, `-constant`, `-number`, `-function`, `-type`, `-builtin`, `-tag`, `-attribute`, `-comment` and `-text`, each a `light-dark()` in `styles/theme.css`, so one theme covers both modes. In the light, Loupe's follows Nova's rules: one hue for keywords, tags and booleans, the rest a walk round the wheel from it at one lightness, and a string's quotes a darker shade of the string. The ground is a control's fill, white in the light and a step above the page in the dark, unless `--code-ground` sets another. Marked lines take `--color-code-mark`, `-add` and `-remove` for their ground, and the same with `-edge` for the line's bar, its number and the diff's counts. A removal is striped as well as tinted, so it reads apart from an addition by more than its colour, and a word marked on a changed line takes the line's tint again. To restyle code, set those tokens, or use iamsteve's or mcknny's with `theme="iamsteve"` on a `Code` or `data-code-theme="mcknny"` on anything around it. Loupe's transformers highlight Tailwind's `@theme` and bare custom properties as CSS, and number lines with `showLineNumbers` in a code fence's meta, or `showLineNumbers=12` to start at 12.

### Writing a component

A component takes the name and props of the React Aria component it wraps: React Aria’s `Link` is our `Link`, and its `NavigationTree` is ours, down to `NavigationTreeItemContent`. React Aria is the primitive, and the package adds Parchment’s styling. Where React Aria has nothing, use the HTML element’s name.

Name props as React Aria does, too. A boolean starts with `is` for a state, as in `isMultiline`, or `has` for a part, as in `hasTitles`. `showArrow`, from React Aria’s starter kit, is the one exception. `label` is always text you can see, and a name only screen readers get is `aria-label`, as on `Composer` and `DialogClose`. A props type is the component’s name and `Props`, and where a component adds nothing, it re-exports React Aria’s own. A recipe is the component’s name in camelCase, and a part’s name follows it, as in `selectTrigger`. Export a recipe when something outside its file draws with it, as `ColorField` does with `textFieldInput`.

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

Import `tv` from `src/tv.ts` rather than tailwind-variants itself. It teaches the merge the tokens’ names, so `text-body` (a size) and `text-ink` (a colour) don’t cancel each other out. Text in a control, from a button’s to a field’s and its label, is `text-control`: 13px with a mouse or trackpad, and 16px on a touch screen, where iOS zooms into a field with smaller text. Change `--text-control` to change it everywhere. It sits on `--text-control--line-height`, a fixed 20px rather than a multiple, so a control keeps its height at either size. A 16px line, to match an icon, would be too tight for 16px text, and Chrome ignores a field’s line when it’s no taller than the text. Instead, a control that can hold just an icon gives the icon the line’s height, as `Button` and `ToggleButton` do with `[&>svg]:my-[calc((1lh-1rem)/2)]`.

Size bars, headers and rows by padding around their content, not a fixed height, so they fit whatever they hold: `py-2` around a 28px button rather than `h-11`. Set a height only where something else has to know it, such as the offset of a sticky element below another, and then say in a comment which content and padding it adds up to, so a change to one shows up in the other.

### Checks

| Command | What it does |
|---|---|
| `pnpm ui` | The preview page, the palette and every component in its states, at localhost:5199 |
| `pnpm test` | Vitest across the workspace, with an axe check for each component, then a check that the Elyx tokens match `styles/theme.css` |
| `pnpm lint` | oxlint, with the accessibility rules on. The icons package and device aren’t linted yet |
| `pnpm --filter @parchment/ui build` | Builds `lib`, which is committed so releases can install it |
| `pnpm --filter @parchment/ui site` | Builds the preview and puts it up at loupe.parchment.studio, with Wrangler signed in to Parchment Studio’s Cloudflare |

## Elyx

`design/` is the Elyx project, with `packages/ui` and `packages/icons` as its dependencies. `foundations.elyx` shows the colour roles, elevation, type, corners and spacing together, as the components use them: switch the theme to see them in the dark, and the pointer to coarse to see control text as it is on a touch screen.

Its colours, type, corners, spacing and shadows are written from `packages/ui/styles/theme.css`, so change the CSS, then run:

```sh
pnpm elyx:tokens
```

That writes the tokens in `design/tokens` (`colors.elyx`, `colors-dark.elyx`, `typography.elyx`, `typography-coarse.elyx`, `lengths.elyx` and `fonts.elyx`) and the components in `design/components` (`elevation.elyx` and `text.elyx`). Don’t edit them by hand, as `pnpm test` fails when they don’t match the CSS.

`colors` holds the palette, in hex, and the roles. `colors-dark.elyx` gives every role its dark value, in the `theme=dark` context, even a role that only names another, such as `inverse`, as Elyx would keep its light value. Elyx can’t mix a colour by the theme, so each tint is a token of its own in `tints`, named for its layer and strength: `tints.overlay-8` is `bg-bleed/8` on an overlay. Its tokens can’t hold a shadow either, so each level is a component in `elevation.elyx`, with the fill it goes with and its corners from `lengths`. Instance one, then give it a size and contents. CSS paints a shadow’s first layer on top and Elyx its last, so a level’s layers are in the opposite order to `styles/theme.css`.

`typography` holds each text style’s size, in points, and its leading, as a multiple of the size, and `typography-coarse.elyx` gives control text its touch-screen 16 in the `pointer=coarse` context. `fonts` names the families as the desktop does, so Elyx draws Elza Round Variable and Auger Mono once they’re activated in Adobe Fonts. Each text style is a text layer in `text.elyx`: instance `body`, `control`, `label` or `title`, then set its contents. A weight or tracking that `styles/theme.css` sets for a style goes on its layer, as `title` is Bold and drawn in by 1%. Otherwise weights aren’t tokens, so set `font-style: "Medium"` where a component does. A new text style needs a caption, and a new family its desktop name, in `scripts/elyx-tokens.mjs`. The script stops and says which.

`control-leading` is 20px in the CSS, but Elyx takes leading only as a multiple of the size, so there it’s a multiple of `control-size`: 1.54, and 1.25 in the `pointer=coarse` context, which Elyx draws as 20px either way. So `control` text with 6px padding above and below comes out 32px tall, as in code.

`lengths` holds the corners and spacing, in pixels, under Tailwind’s names: `radius-lg` is `rounded-lg`, and `spacing-3` is `p-3` or `gap-3`. A half step takes a dash, so `spacing-1-5` is `p-1.5`. `styles/theme.css` sets them in an `@theme` block of their own, so the components’ classes didn’t change. Tailwind spaces by any multiple of `--spacing`, but Elyx needs a token for each step, so it gets the 14 that `styles/theme.css` lists, from 2px to 64px. `pnpm test` fails when a component rounds to a corner or spaces by a step that has no token.

`packages/ui/elyx/README.md` covers placing the components themselves, as code layers.

## Logos

Each logo is the company’s own, a version drawn for one size, or both. Draw a version wherever theirs doesn’t hold up, usually at 16px, or where there isn’t one worth using anymore.

### Adding a logo

Put the company’s logo in `packages/logos/source/<name>.svg`, as they supply it. It scales to any size.

To draw one for 16px, export it from a 16px artboard to `source/16/<name>.svg`. That’s used at 16px, and the original still covers every other size. Any size works the same way, eg: `source/24/`. A logo with no original shows only at the sizes it’s drawn.

Draw in black, with white for anything knocked out. Black and dark greys become `currentColor`, and white and light greys `--icon-fill`, the same knock-out as the icons. Any colour stays as it is, like the yellow of Buy Me a Coffee’s cup.

The build leaves out a group called `Keylines`, and warns about a drawing that isn’t as tall as its folder. `pnpm logos` builds, and `pnpm logos:watch` rebuilds whenever `source/` changes. Open `packages/logos/preview.html` to see every logo at 16, 24 and 32px, and which sizes are drawn.

### What the build makes

| Output | Use |
|---|---|
| `svg/<name>.svg`, `svg/<size>/<name>.svg` | Clean files for anything that takes an SVG |
| `lib/astro/Logo.astro` | Astro component |
| `lib/react/index.js` | React component |
| `lib/index.js` | `toSvg()`, `resolveLogo()` and `logoNames()` for anything else |
| `logos.json` | Every logo, whether it has an original, and the sizes it’s drawn at |

### Using it in a site

```sh
pnpm add github:parchmentdesignstudio/loupe#logos
npm install github:parchmentdesignstudio/loupe#logos
```

```astro
---
import Logo from '@parchment/logos/astro'
---
<Logo name="fingerprint" />
<Logo name="github" label="GitHub" />
<Logo name="iamsteve" size={24} />
```

```jsx
import { Logo } from '@parchment/logos/react'

<Logo name="buy-me-a-coffee" size={24} />
```

Logos are 16px tall by default, and as wide as their proportions make them. `size` sets the height. A version drawn for that size is used when there is one, otherwise the original scales to it, and asking for a size a logo has neither for is an error. Without `label` the logo is hidden from screen readers.

## Compose

Compose works on a page that’s already running in a dev server. It groups elements, lays a group out as a grid, a subgrid or flex, and moves things about on the grid, all as changes to the live page. Nothing is written to the source. Copy changes gives a list of what changed, each element named by its tag, classes, words and the file and line it was written at, to paste to an agent or make by hand.

`pnpm compose` opens a page of loose, stacked elements to try it on, at localhost:5191.

| To | Do |
|---|---|
| Open or close it | ⌥G, the Compose button, or its button in Astro’s toolbar |
| Select | Click. A click stays at the level of what’s selected, and clicking inside what’s selected goes one level in. The arrow keys select the element that lies that way among its siblings, ⇧↩ the parent, ↩ the first child and ⇥ the next sibling, and the panel’s header lists the way down to it |
| Select several | ⌘-click or ⇧-click |
| On a phone | Two taps select, as one finger scrolls the page. Select several, in the panel’s menu, makes each double tap add to what’s selected. Drag what’s selected, or its handles, as with a mouse |
| Group, ungroup | ⌘G wraps what’s selected in a new `div`. ⇧⌘G takes a wrapper away and leaves what it held |
| Lay out | Block, Grid or Flex in the panel. A new grid has 12 columns, with every child across all of them, so nothing moves until it’s dragged. A grid inside a grid can take its columns or rows as a subgrid |
| Set the gap | A bare number is a step of Tailwind’s spacing scale, so 4 is `gap-4`, and 4 8 is `gap-y-4 gap-x-8`. The list of changes names the class beside the value. A length, such as 24px, is kept as it’s typed |
| Drag the gap or padding | A selected container has a green grip in each gap and on each side’s padding. Dragging one moves it by steps of the spacing scale. With ⌥ held, a gap’s grip sets the gap both ways, and a side’s grip sets the opposite side too. The list of changes gathers matching sides, as `padding-inline: 2rem (px-8)` |
| Move on a grid | Drag, or ⇧ with an arrow key. The handles, or ⌥ with an arrow key, change what it spans. Drag past the last row to start a new one |
| Share a row | Drop an item on another and they share its row: two take half the columns each, three a third, in the order they sit under the pointer. Dropped on empty cells it goes where it’s put, and ⌥ lets it overlap instead of sharing |
| Move anywhere | What’s dragged follows the pointer, with a line or a dashed box where it will land. It can go before any element on the page, into another group, or out of a grid once the pointer leaves it. Within a few pixels of a group’s edge is beside the group, not in it |
| Reorder | Outside a grid, dragging or ⇧ with an arrow key changes the order. In a stack, dropping on the left or right third of another element puts the two side by side, in a new 12-column grid with half each |
| Fill the width with type | Fill width, in the panel, for an element that holds text, such as a line of a hero’s lock-up. It goes on one line, or as many as it has `<br>`s, at a size that’s a share of its container’s width (`cqi`), so it keeps filling it as the page narrows. Its parent becomes the container. Change the columns it spans and it’s sized again |
| Size the columns | Drag a column line and one of the columns beside it takes what the other gives up, in quarters of a fraction. The plus after the last line adds a column |
| Align in its cell | Across and Down, in the panel, for an item on a grid |
| Duplicate, delete | ⌘D and Delete, each in the list of changes |
| Everything else | The panel has no names beside its controls, and only what changes the selected element’s layout. The icon at the start of a field or select says what it sets. The panel sits at the top right and grows downwards, and nothing in it moves when it reports: the button says Copied in the width it has, and anything else floats beside the panel. Some stand in for icons not drawn yet, listed in `packages/icons/WANTED.md`. Group, ungroup, duplicate, delete, undo, redo, reset and handing an item back to the grid to place are in its menu, each with its shortcut |
| Lay out a width at a time | Every width, at the foot of the panel, is the breakpoint what you change applies from: every width, or `lg` and up. Narrow the window below it and the page falls back to what’s under it, to compose that too. They’re Tailwind’s breakpoints, or the site’s own where it sets `--breakpoint-*`, and the list of changes keeps each apart, as `From lg (1024px): grid-column: 1 / span 6`. Grouping and moving are the same at every width |
| Name a line | Double-click its number. A place then uses the name, as in `grid-column: content-start / content-end` |
| Undo, redo | ⌘Z and ⇧⌘Z. Reset puts the page back as it was |

The first time an item is moved on a grid, every item in that grid is given the place it has. The browser moves an item it placed itself when another is put in its way, so without this, dragging one thing would shuffle the rest, and nothing could overlap.

CSS has a property for type that fills its width, `text-fit: grow`, but it isn’t in every browser yet, so Compose writes the `cqi` size, which is, and the list of changes says the property could take over.

The panel is drawn with Loupe’s own components, inside a shadow root, so the page’s styles don’t reach it and Loupe’s don’t reach the page. `pnpm --filter @parchment/compose build` gathers Compose, React, the components and their compiled styles into `lib/compose.js`, which is committed, as a site that has none of them still has to run it. The demo runs from `src`, so a change there shows without building.

The changes are kept for the tab, so they’re made again after a reload, and Compose opens again if it was open. They’re let go when the page itself is different, as it is once an agent has put them in the source. A copy that was changed after it was made comes back as it looked, without its own entries in the list.

### Using it in a site

```sh
pnpm add -D github:parchmentdesignstudio/loupe#compose
```

In Astro it’s an integration, which adds Compose to the dev toolbar and keeps the file and line Astro gives each element:

```js
import compose from '@parchment/compose/astro'

export default defineConfig({ integrations: [compose()] })
```

With Vite alone it’s a plugin, which adds a Compose button to every page of the dev server. Run `locate` from `scripts/locate.mjs` beside it, as Loupe’s tools do, and each element in the list has its file and line as well:

```js
import { compose } from '@parchment/compose/vite'

export default defineConfig({ plugins: [compose()] })
```

Anywhere else, such as Next.js, whose dev menu can’t be added to, call `mount()` from code that only runs in development. This hasn’t been tried in Next.js yet, and without a file and line each element is named by a path of selectors instead:

```js
if (process.env.NODE_ENV === 'development') import('@parchment/compose').then(({ mount }) => mount())
```

With the Astro integration or the Vite plugin, the dev server also keeps the list in `.compose/changes.md` in the site, written as each change is made and removed when there are none, so an agent can be told to make the layout changes in that file with nothing copied. Add `.compose` to the site’s `.gitignore`. `window.parchmentCompose.changes()` returns the same list, for an agent that can drive the browser to read for itself.

## Releasing

Each package is published to its own branch, so npm and pnpm can both install it from GitHub.

Loupe has one version, in the root `package.json`, which the preview shows beside the logo. Below 1.0 it's marked alpha there: usable, as React Aria stands behind it, but not yet at the quality to rely on in production. 1.0 is when it is. The UI, icons and logos share it, so they move together even when only one of them changed. `pnpm bump` sets it everywhere:

```sh
pnpm bump 0.9.0
pnpm release icons
```

Release checks the package is at Loupe's version, builds, checks everything is committed, pushes `packages/icons` to the `icons` branch and tags it `icons@<version>`. Sites can pin with `#icons@0.8.0` or follow `#icons`. The UI package releases the same way, with `pnpm release ui`, and the logos with `pnpm release logos`, to the `logos` branch. Compose goes to the `compose` branch with `pnpm release compose`.

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
