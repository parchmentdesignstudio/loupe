# Actions

## Button

For an action on this page. Going to another page is a Link. Several actions behind one button is a Menu.

Variants: `primary`, `secondary`, `quiet`, `danger`, `outline`, `ghost`. Shapes: `rounded`, `full`. Sizes: `medium`
(32px), `small` (28px). Nothing else exists.

- `primary`, marigold: the one action the view is for. One per view, as two means neither leads. A dialog is a view
  of its own. It's the default in the types, so always set `variant`.
- `secondary`, white and raised: most actions. The usual choice.
- `quiet`, slate: a lead quieter than marigold, such as the main action in a panel beside a page that has its own primary.
- `danger`, red: deletes or can't be undone. On a page, keep it apart from the other actions, never beside Save,
  and have it open a confirming Modal. In that Modal, the confirming button is `danger` too, last, after Cancel.
- `outline`: actions in a bar of tools or filters above a list, where a row of raised buttons would be heavy.
- `ghost`: an icon alone in a header, a row or a dialog's corner. Always with `aria-label`.
- `shape="full"`: a pill round a label, or a circle round an icon. `rounded` otherwise.
- `size="small"`: in tables, toolbars, Alert actions and anywhere dense. `medium` otherwise.

Icons go in `start` or `end`, not as children beside text. A button with only an icon takes the icon as its child
and an `aria-label`. `isPending` shows a spinner and keeps the width.

```tsx
// Correct, from the leads screen
<Button variant="primary" end={<Icon name="plus" />}>New lead</Button>
<Button variant="outline" start={<Icon name="list-bullet-rectangle-portrait" />}>Filters</Button>
<Button variant="ghost" size="small" aria-label="Hide the menu"><Icon name="sidebar-left" /></Button>

// Incorrect: no variant (so it's primary), an icon as a sibling, and a size that doesn't exist
<Button size="large"><Icon name="plus" /> Add</Button>
```

## Link

For going somewhere: another page, or a place on this one. `aria-current="page"` marks the page you're on. A Link
in a sentence is underlined by the component, so don't style it.

```tsx
// Correct
<Link href="/leads/256">REF-0256</Link>

// Incorrect: navigation as a button with an onPress that changes location
<Button onPress={() => navigate('/leads/256')}>REF-0256</Button>
```

## Menu

For actions, or a choice that changes a view, behind one Button in a `MenuTrigger`. Picking a form value is a Select.
`MenuItem variant="danger"` for a destructive item, last, after a `MenuSeparator`. `selectionMode` on a Menu or
MenuSection for filters and display options, as the leads screen's Filters and Display menus are. In a table row,
use `RowActions`. An item that deletes opens a confirming Modal, as a danger Button does, unless a Toast offers Undo.

## ToggleButtonGroup

A segmented control: two to five options side by side, always visible.

```
How many options, and how much room?
 ├── 2 to 5 short options, room to show them → ToggleButtonGroup
 ├── More, or long labels → Select
 ├── Switches between panels of content → Tabs
 └── A form value with a label and validation → RadioGroup
```

Variants: `well` (the default for one choice: a fill slides between them) and `raised` (the default for several:
each chosen one tinted pink). Sizes `medium`, `small`. `width="fill"` stretches it across its container; `hug`
otherwise. Icon-only options each need `aria-label` and a Tooltip.

## Toolbar

Controls in a row with one Tab stop and arrow keys between them, such as an editor's tools. Give it an
`aria-label`. A Separator inside stands upright. A bar of filters above a table is a plain row, `flex flex-wrap gap-2`, not a
Toolbar: each filter with options is an `outline` Button opening a Menu with `selectionMode`, and a date range is a
DateRangePicker with an `aria-label`, as a label above it would break the row. Buttons and fields in the bar stay
`medium`, so they line up.

## Chip

A suggestion to tap, such as a reply in a chat, in a `ChipGroup` with an `aria-label`. Sizes `small` (20px) and
`medium` (24px) for a value in a table or a line of text, `large` (32px, the default) to tap. Not for status
(Status) or removable labels (TagGroup).

## Keyboard

A shortcut, such as ⌘K, written as text: `<Keyboard>⌘K</Keyboard>`. It draws the symbols itself. `raised` in a
sentence; inside a Tooltip or a MenuItem it's plain without being told.
