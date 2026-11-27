// The overlay's own styles, inside its shadow root beside Loupe's sheet, so the page's don't reach it and its don't
// reach the page. The panel is Loupe's components; this is what's drawn over the page
export const styles = `
@layer reset {
  :host { all: initial; }
}
:host {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  pointer-events: none;
  color-scheme: light dark;
  --select: oklch(0.55 0.2 255);
  --grid: oklch(0.62 0.22 350);
  --space: oklch(0.6 0.14 165);
  font-family: var(--font-sans);
  color: var(--color-ink);
}
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
.grip {
  pointer-events: auto;
  translate: -50% -50%;
  width: 12px;
  height: 24px;
  padding: 4px;
  border-radius: 6px;
  background: var(--space) content-box;
  cursor: ew-resize;
  touch-action: none;
  opacity: 0.75;
}
.grip.wide { width: 24px; height: 12px; cursor: ns-resize; }
.grip:hover { opacity: 1; }
.band { background: color-mix(in oklab, var(--space) 22%, transparent); }
.note { padding: 0 6px; border-radius: 4px; background: var(--space); color: white; font: 500 11px/18px ui-monospace, Menlo, monospace; }
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
  padding: 4px 8px;
  border-radius: var(--radius-lg);
  background: var(--color-raised);
  box-shadow: var(--shadow-raised);
  font: 12px/20px var(--font-mono);
  color: var(--color-ink);
  pointer-events: auto;
}

.panel, .launcher, .floats > * { pointer-events: auto; }
.panel, .launcher { position: fixed; }
.panel { right: 16px; bottom: 16px; user-select: none; }
.launcher { left: 16px; bottom: 16px; }
.handle, .badge, .grip { touch-action: none; }
@media (pointer: coarse) {
  .handle { width: 18px; height: 18px; border-radius: 5px; }
}
`
