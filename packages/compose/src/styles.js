// The overlay's own styles, inside its shadow root, so the page's don't reach it and its don't reach the page.
// The colours are Loupe's, written out, as the page it's on may not have the tokens
export const styles = `
:host {
  all: initial;
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  pointer-events: none;
  color-scheme: light dark;
  --ink: light-dark(oklch(0.256 0.039 169.9), oklch(0.95 0.011 76.6));
  --muted: light-dark(oklch(0.5 0.025 169.9), oklch(0.903 0.013 56.2));
  --panel: light-dark(oklch(0.986 0.002 67.8), oklch(0.2 0.027 169.9));
  --raised: light-dark(oklch(1 0 0), oklch(0.29 0.035 169.9));
  --tint: light-dark(oklch(0.18 0.024 67.8 / 0.06), oklch(0.95 0.054 169.9 / 0.08));
  --line: light-dark(oklch(0.18 0.024 67.8 / 0.14), oklch(0.95 0.054 169.9 / 0.16));
  --accent: oklch(0.834 0.1525 85.6);
  --select: oklch(0.55 0.2 255);
  --grid: oklch(0.62 0.22 350);
  font: 13px/20px system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
  color: var(--ink);
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }

.layer > * { position: fixed; pointer-events: none; }
.hover { border: 1px solid var(--select); opacity: 0.6; }
.selected { border: 1.5px solid var(--select); }
.strip { background: color-mix(in oklab, var(--grid) 5%, transparent); box-shadow: inset 1px 0 color-mix(in oklab, var(--grid) 55%, transparent), inset -1px 0 color-mix(in oklab, var(--grid) 55%, transparent); }
.rule { box-shadow: inset 0 1px color-mix(in oklab, var(--grid) 55%, transparent), inset 0 -1px color-mix(in oklab, var(--grid) 55%, transparent); }
.quiet.strip { background: none; box-shadow: inset 1px 0 color-mix(in oklab, var(--grid) 30%, transparent), inset -1px 0 color-mix(in oklab, var(--grid) 30%, transparent); }
.quiet.rule { box-shadow: inset 0 1px color-mix(in oklab, var(--grid) 30%, transparent), inset 0 -1px color-mix(in oklab, var(--grid) 30%, transparent); }
.badge {
  pointer-events: auto;
  translate: -50% -50%;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--grid);
  color: white;
  font: 500 10px/16px ui-monospace, Menlo, monospace;
  text-align: center;
  white-space: nowrap;
  cursor: text;
  user-select: none;
}
.handle {
  pointer-events: auto;
  translate: -50% -50%;
  width: 9px;
  height: 9px;
  border: 1.5px solid var(--select);
  border-radius: 2px;
  background: white;
}
.drop { background: var(--select); border-radius: 1px; }
.tag {
  translate: 0 -100%;
  padding: 0 5px;
  border-radius: 4px 4px 0 0;
  background: var(--select);
  color: white;
  font: 500 10px/16px ui-monospace, Menlo, monospace;
  white-space: nowrap;
}

.naming {
  position: fixed;
  translate: -50% -50%;
  width: 120px;
  pointer-events: auto;
}

.panel, .launcher { pointer-events: auto; position: fixed; }
.panel {
  right: 16px;
  bottom: 16px;
  width: 296px;
  border-radius: 12px;
  background: var(--panel);
  box-shadow: 0 0 0 1px var(--line), 0 12px 32px -8px oklch(0 0 0 / 0.28), 0 2px 6px oklch(0 0 0 / 0.08);
  user-select: none;
}
.panel > * { padding: 8px; }
.panel > * + * { border-top: 1px solid var(--line); }
header { display: flex; align-items: center; gap: 2px; cursor: grab; }
.crumbs { flex: 1; min-width: 0; display: flex; align-items: center; overflow: hidden; padding-left: 4px; color: var(--muted); white-space: nowrap; }
.crumbs button { padding: 4px 2px; min-width: 0; overflow: hidden; text-overflow: ellipsis; color: inherit; }
.crumbs button:last-child { color: var(--ink); font-weight: 500; flex-shrink: 0; max-width: 100%; }
.crumbs span { padding: 0 1px; opacity: 0.6; }
.body { display: grid; gap: 8px; }
.row { display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 8px; }
.row > div { display: flex; gap: 6px; min-width: 0; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.hint { margin: 0; padding: 4px; color: var(--muted); }
footer { display: flex; align-items: center; gap: 6px; }
footer output { flex: 1; padding-left: 4px; color: var(--muted); }

button, input, select { font: inherit; color: inherit; margin: 0; }
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 10px;
  border: 0;
  border-radius: 8px;
  background: none;
  white-space: nowrap;
  cursor: default;
}
button:hover:not(:disabled) { background: var(--tint); }
button:disabled { opacity: 0.4; }
button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--select); outline-offset: 1px; }
button.raised, .launcher { background: var(--raised); box-shadow: 0 0 0 1px var(--line), 0 1px 2px oklch(0 0 0 / 0.06); }
button.raised:hover:not(:disabled) { background: var(--raised); box-shadow: 0 0 0 1px var(--line), 0 2px 4px oklch(0 0 0 / 0.1); }
button.primary { background: var(--accent); color: oklch(0.256 0.039 169.9); font-weight: 500; }
button.primary:hover:not(:disabled) { background: color-mix(in oklab, var(--accent) 92%, black); }
button.icon { padding: 6px; }
button kbd { font: inherit; color: var(--muted); }
svg { display: block; width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.segments { display: flex; flex: 1; padding: 2px; border-radius: 8px; background: var(--tint); }
.segments button { flex: 1; padding: 2px 6px; border-radius: 6px; }
.segments button[aria-pressed='true'] { background: var(--raised); box-shadow: 0 0 0 1px var(--line), 0 1px 2px oklch(0 0 0 / 0.06); }
.toggle[aria-pressed='true'] { background: var(--ink); color: var(--panel); }
input, select {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 4px 8px;
  border: 0;
  border-radius: 8px;
  background: var(--raised);
  box-shadow: 0 0 0 1px var(--line);
  font-family: ui-monospace, Menlo, monospace;
  font-size: 12px;
}
input::placeholder { color: var(--muted); opacity: 0.7; }
input[aria-invalid='true'] { box-shadow: 0 0 0 1.5px oklch(0.6 0.2 28); }
.stepper { display: flex; align-items: center; flex: none; border-radius: 8px; background: var(--raised); box-shadow: 0 0 0 1px var(--line); }
.stepper button { padding: 4px 7px; }
.stepper output { min-width: 18px; text-align: center; font-variant-numeric: tabular-nums; }
.launcher { left: 16px; bottom: 16px; padding: 6px 12px; border-radius: 999px; }
.launcher:hover:not(:disabled) { background: var(--raised); }
`
