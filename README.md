# Loupe

Parchment’s shared design library, used by mcknny, iamsteve.me and parchment. Each part is its own package under `packages/`.

| Package | What it is |
|---|---|
| `@parchment/icons` | Line and solid icons at 16 and 24px |

## Icons

### From Sketch to the library

1. Draw the icon in the icons Sketch file as a symbol named `line/16/name`, `solid/24/name` and so on. Only symbols with that name pattern are exported; loose artboards and drafts are ignored.
2. In Sketch, run **Plugins › Icon › Export to Loupe** (ctrl alt shift e). It writes every icon to `packages/icons/source/` with keylines hidden, then runs the build. No folder to choose.
3. Commit, then release (below).

A symbol name used twice is left out until one is renamed. An icon with nothing visible (usually art that ended up inside the `Keylines` group) is left out of the build with a warning.

`pnpm icons:watch` rebuilds whenever `source/` changes. Open `packages/icons/preview.html` to see every icon.

### What the build makes

| Output | Use |
|---|---|
| `svg/<variant>/<size>/<name>.svg` | Clean files for anything that takes an SVG |
| `sprite/<variant>-<size>.svg` | One sprite per set, for `<use href="sprite/line-16.svg#home">` |
| `lib/astro/Icon.astro` | Astro component |
| `lib/react/index.js` | React component |
| `lib/index.js` | `toSvg()`, `resolveIcon()` and `iconNames()` for anything else |
| `icons.json` | Every name, by variant and size |

Icons draw in `currentColor`. The knock-out shape behind some line icons uses `--icon-fill`, which is `none` unless a site sets it.

### Using it in a site

```sh
pnpm add github:stevemckinney/loupe#icons
npm install github:stevemckinney/loupe#icons
```

```astro
---
import Icon from '@parchment/icons/astro'
---
<Icon name="home" />
<Icon name="search" variant="solid" size={24} label="Search" />
```

```jsx
import { Icon } from '@parchment/icons/react'

<Icon name="home" size={20} className="text-olive" />
```

`size` is the rendered size. The closest drawn grid is used, so 20 draws from the 24px set, and an icon only drawn at 24 still works at 16. Without `label` the icon is hidden from screen readers.

## Releasing

Each package is published to its own branch, so npm and pnpm can both install it from GitHub.

```sh
pnpm release icons
```

This builds, checks everything is committed, pushes `packages/icons` to the `icons` branch and tags it `icons@<version>`. Bump the version in `packages/icons/package.json` first, then sites can pin with `#icons@0.2.0` or follow `#icons`.
