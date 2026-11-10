# Elyx code layers

What Elyx renders when a design uses @parchment/ui as code layers.

- `CodeLayerRoot.tsx` wraps every code layer and imports `compiled/styles.css`.
- `*.elyx.tsx` are entries: each takes plain props and builds the real component, so a designer can set them. They import from `lib/`, as Elyx can't resolve the `.js` imports in `src/` to `.tsx`, so run `pnpm build` after changing a component.
- `compiled/styles.css` is Tailwind's output for `styles.css`, with the `@layer` wrappers removed, as code layers don't read rules inside them. Each `light-dark()` takes its light value, as code layers don't read that either and Elyx passes them no theme, so they show the light mode whatever the theme. Elyx doesn't run builds, so run `pnpm --filter @parchment/ui elyx:css` after styles or components change, and commit the result.

Known limit: React Aria imports `use-sync-external-store/shim`, which ships only CommonJS, so Elyx can't load these components yet and a code layer shows a failed render. The entries and the stylesheet render once that import resolves.
