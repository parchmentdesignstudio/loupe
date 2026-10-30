# Loupe

Parchment’s shared design library, used by mcknny, iamsteve.me and parchment. Each part is its own package under `packages/`.

| Package | What it is |
|---|---|
| `@parchment/icons` | Line and solid icons at 16 and 24px |
| `@parchment/ui` | Accessible React components, built on React Aria |

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

To change a token, set its variable on `:root`, such as `--ink` or `--text-size`.

### Writing a component

Wrap the React Aria component and style it with a `tv()` recipe. Name the variants after React Aria’s render props (`isHovered`, `isPressed`, `isFocusVisible`, `isDisabled`), so each state’s classes live in the recipe rather than in conditions. `composeRenderProps` hands React Aria’s state to the recipe, and keeps a `className` prop working, as a string or a function.

```tsx
export const chip = tv({
  extend: focusRing,
  base: 'rounded-full bg-paper px-3.5 py-2 text-body shadow-raised',
  variants: {
    isPressed: { true: 'scale-97' },
    isDisabled: { true: 'opacity-40' },
  },
})

export function Chip(props: ChipProps) {
  return <AriaButton {...props} className={composeRenderProps(props.className, (className, state) => chip({ ...state, className }))} />
}
```

Import `tv` from `src/tv.ts` rather than tailwind-variants itself. It teaches the merge the tokens’ names, so `text-body` (a size) and `text-ink` (a colour) don’t cancel each other out. Inputs keep 16px text, as iOS zooms into anything smaller.

### Checks

| Command | What it does |
|---|---|
| `pnpm ui` | The preview page, every component in its states, at localhost:5199 |
| `pnpm test` | Vitest, with an axe check for each component |
| `pnpm lint` | oxlint, with the accessibility rules on. The icons package isn’t linted yet |
| `pnpm --filter @parchment/ui build` | Builds `lib`, which is committed so releases can install it |

## Releasing

Each package is published to its own branch, so npm and pnpm can both install it from GitHub.

```sh
pnpm release icons
```

This builds, checks everything is committed, pushes `packages/icons` to the `icons` branch and tags it `icons@<version>`. Bump the version in `packages/icons/package.json` first, then sites can pin with `#icons@0.2.0` or follow `#icons`. The UI package releases the same way, with `pnpm release ui`.
