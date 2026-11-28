# Panels

A panel of controls beside or over the thing it changes: an inspector, a tool's settings, a palette that floats. It's
used many times an hour, so it's dense and quiet, and its order does the explaining. Compose's panel
(`packages/compose/src/panel.jsx`) is the worked example, and `packages/compose/prototype` has the three layouts it
was chosen from.

## What goes where

```
What is it?
 ├── What's selected → the header: its name, with where it sits before it
 ├── Changes what's selected → the body, as a control
 ├── Changes how the whole panel works, such as a breakpoint or a mode → the header or the foot
 ├── Done by a shortcut, or seldom → a Menu in the header
 ├── The one thing the panel is for → the foot, as its only Button
 └── News about the last action → a line above the foot, only while there's something to say
```

A panel reads top to bottom as what's selected, what can be changed about it, then what to do with the result. Something
in the wrong band is what makes a panel feel untidy, more than any spacing: a mode among the controls reads as a
property of the selection, and a second button in the foot competes with the first.

## The header

- The selected thing's name is `font-medium`. Where it sits comes before it in `text-muted`, with `›` between, and
  at most two steps of it. Three names of equal weight read as three choices, not as one thing and its place.
- A step that can be pressed, to select it, is a `ghost` `small` Button. The selected thing itself is text.
- Then a `ghost` `small` Button with `ellipsis` and `aria-label="More"`, opening the Menu, and one to close the
  panel if it closes. Nothing else.

## The body

Fields are `filled` and `small`, as [forms](forms.md#variants) has it for an inspector, in one column `w-72` wide.

```
Does the control need a name beside it?
 ├── Its options say what it is, such as Block, Grid, Flex → no name
 ├── It's a Switch → its own label is the name
 ├── It's a Select → put the name in each option: "Across, center", "Down, stretch"
 ├── It's a field whose value says what it is, such as a list of column sizes → no name, a placeholder for when it's empty
 └── It's a field holding a bare number or word → it keeps a name
```

- Every row has the same shape. Either each control has its name in one column, at one width, or none has. A panel
  where some rows have a name and others start at the edge has no line for the eye to run down.
- With no names, each control still has an `aria-label` that says what it sets.
- Controls that set one thing share a row, `gap-1.5` apart: how many columns and their sizes, or where an item sits
  across and down. Rows are `gap-3` apart, twice that, as [grouping](tokens.md#grouping) asks, so a pair reads as a pair.
- Switches go together, last, one under another. Never one alone between two rows of fields.
- Show only what applies to what's selected. A control that would do nothing is left out, not dimmed.
- Don't repeat in the panel what the canvas already shows, such as where the selection sits.

## The menu

Everything done by a shortcut or done seldom: grouping, duplicating, undo and redo, resetting. Each `MenuItem` ends
with its `Keyboard`, which is how the shortcut is learned. A destructive item is `variant="danger"`, last, after a
`MenuSeparator`. An action that's the panel's main one never goes here.

## The foot

- One Button, last. It's `primary` once it has something to act on and `secondary` until then, and it answers a
  press either way, as the [product-design](../../product-design/SKILL.md) skill sets out.
- A count goes on the button, as in "Copy 3 changes". Text beside a button in a narrow foot wraps to three lines.
- A mode that changes what the controls apply to, such as a breakpoint, sits beside the button as a `filled`
  `small` Select with an `aria-label`.
- What the last action said, such as "Copied" or "Nothing to undo", is an `<output>` in `text-label text-muted` on its
  own line above, and gone once it's been read.
- Reset, and anything else that undoes work, is in the menu, not beside the button.

```tsx
// Correct
<header className="flex items-center gap-1 p-2">
	<div className="flex min-w-0 flex-1 items-center">
		<Button variant="ghost" size="small" className="text-muted" onPress={selectParent}>main</Button>
		<span className="text-muted">›</span>
		<span className="px-2 font-medium">group</span>
	</div>
	<MenuTrigger>
		<Button variant="ghost" size="small" aria-label="More"><Icon name="ellipsis" /></Button>
		<Menu>
			<MenuItem onAction={group}>Group <Keyboard>⌘G</Keyboard></MenuItem>
			<MenuItem onAction={reset}>Reset every change</MenuItem>
		</Menu>
	</MenuTrigger>
</header>
<div className="flex flex-col gap-3 px-3 pb-3">
	<ToggleButtonGroup aria-label="Layout" size="small" width="fill" selectionMode="single">…</ToggleButtonGroup>
	<div className="flex gap-1.5">
		<NumberField variant="filled" size="small" aria-label="How many columns" />
		<TextField variant="filled" size="small" aria-label="Column sizes" placeholder="Columns" />
	</div>
	<Switch>Fill width</Switch>
</div>
<footer className="flex items-center gap-2 border-t border-bleed/8 p-2">
	<Select variant="filled" size="small" aria-label="The width changes apply from">…</Select>
	<Button variant="primary" size="small">Copy 3 changes</Button>
</footer>

// Incorrect: a mode among the properties, rows of two shapes, and a status beside two raised buttons
<Switch>Select several</Switch>
<div className="flex gap-2"><span className="w-16">Layout</span><ToggleButtonGroup>…</ToggleButtonGroup></div>
<footer className="flex gap-2">
	<output>No changes yet</output>
	<Button variant="secondary">Reset</Button>
	<Button variant="primary">Copy changes</Button>
</footer>
```
