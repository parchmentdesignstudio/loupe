## Conventions

The same as mcknny’s:

- **Files**: kebab-case, such as `device-view.tsx`. Components in PascalCase, props in camelCase
- **CSS**: Tailwind v4 only, without `@apply`. Inline styles only for what’s worked out as it runs, such as positions and sizes on the canvas
- **Names**: short but not abbreviated: `Navigation` not `Nav`
- **Writing**: sentence case and British English everywhere, in the interface and the docs
- **Quotes**: curly, ’ not ', in anything that reads as copy
- **Comments**: only for a true gotcha, in a line or two

## Working on it

Steve is simplifying the tool one change at a time. Each change goes in `LOG.md`: what he asked for, what was done, and any control it repeats. Nothing comes out until he settles a change, as a later idea may build on an earlier one.

## Where things come from

- The phone and desktop frames are mcknny’s, from its `src/assets/images/devices`, and stay as they are. Other devices are drawn in `src/devices/frames.ts` to the same build
- The status bar, island and home indicator follow mcknny’s `Phone.astro` and `StatusBar.astro`
- Icons are Loupe’s. When Loupe doesn’t have one, a Lucide stand-in goes in `src/ui/icon.tsx` under the name Loupe would give it, and it’s listed as one to draw
