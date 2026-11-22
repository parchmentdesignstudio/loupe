---
name: loupe
description: Build interfaces with Loupe, Parchment's React components (@parchment/ui) and tokens. Use when writing or reviewing UI in a project that imports @parchment/ui, picking a component or variant, or choosing a colour, size, corner, space or shadow. Covers which component to use over its alternative, which variant applies where, and which tokens are allowed.
---

# Loupe

Loupe is calm and dense: linen and pine, one marigold action per view, controls 32px tall on a 20px line, and depth
from shadows rather than borders. It's built on React Aria, so behaviour, focus and screen readers come with each
component. Light and dark are one set of roles, so nothing is coloured per theme.

## Three rules that hold everywhere

1. **A component before markup.** Never build a button, field, menu, dialog or list from `div`s and classes when
   Loupe has one. A hand-built one loses keyboard support, focus rings, dark mode and the shadows. Every component,
   trigger and type here imports from `@parchment/ui`. Icons are `<Icon name="plus" />` from
   `@parchment/icons/react`; the names are in `@parchment/icons/icons.json`, run together as SF Symbols' are
   (`magnifyingglass`, `square-and-arrow-up`), so look a name up rather than guess it.
2. **Variants are closed sets.** Each reference lists every variant that exists. An unlisted variant, size or tone is
   a bug, not an option, and the types reject it.
3. **Roles, never values.** Colour with roles (`bg-raised`, `text-muted`), not palette steps (`bg-pine-26`) and never
   raw values (`bg-[#fff]`, `text-[13px]`, `shadow-[…]`, `rounded-[10px]`). Roles carry light and dark, and the
   palette doesn't. See [tokens](references/tokens.md).

`pnpm lint` fails on breaking rules 1 and 3, and on a Button with no variant, with `packages/ui/lint/misuse.mjs`.
Where a raw value is meant, say why on the line above: `// loupe-lint-ignore: a specimen, set larger than any text`.

## Defaults to reach for

- Text: `text-body` for reading, `text-control` inside controls, `text-label` for small labels and meta, `text-title`
  for a heading. Nothing else, and nothing below `text-label`'s 12px.
- Space: Tailwind's steps (`gap-2`, `p-4`). Siblings get `gap` on the parent, not margins on each. Space groups
  things: 4–6px within a unit, 16px between units, 32–40px between sections. See
  [grouping](references/tokens.md#grouping).
- Corners: `rounded-lg` (8px) for most things. Inside a rounded container, the container's radius less the space
  between them.
- Secondary text is `text-muted`. Errors are `text-danger`, always with words that say what's wrong.
- Words: labels, headings and buttons are sentence case. A button says what happens, such as "Send invoice", never
  "Submit" or "OK".
- Headings: the page's is `text-title`, a section's `text-body font-medium`, and a group's name inside a panel
  `text-label text-muted`. A line under a heading is `text-body text-muted`.

## Laying out a page

- `bg-ground` goes once, on the app's root, not on each page. A page pads its content `px-4 py-10 md:px-10`, with
  `gap-8` between its header and what follows, and `gap-4` between a bar of filters and the list under it.
- A page header with an action: `flex items-start justify-between gap-4`, the heading and its line on the left and
  the primary Button on the right.
- Forms and settings sit in one column, `mx-auto max-w-160` (640px), with `gap-10` between sections. Tables and
  lists take the full width.
- A section is a heading over its content in a column, `gap-4` between them, not a card. A `Card` is only for something among others like
  it, such as plans or stats in a grid, and it draws its own box, so don't build one from classes. Table, Alert,
  fields and overlays draw their own box and shadow, so never wrap one in a card as well.
- Something destructive for the whole page, such as "Delete account", goes last, in its own section under
  `border-t border-bleed/8 pt-8`, apart from Save.

## The decisions agents get wrong most

```
What is the action?
 ├── Goes to another page → Link
 ├── The one thing this view is for → Button variant="primary", once per view
 ├── Destroys or can't be undone → Button variant="danger"
 ├── In a toolbar or bar of filters → Button variant="outline"
 ├── Icon only, in a header or row → Button variant="ghost" with aria-label
 └── Anything else → Button variant="secondary"
```

`Button` defaults to `primary`, so always set `variant`. A Button is never `isDisabled`: when it can't act yet, it
answers the press, as the [product-design](../product-design/SKILL.md) skill sets out. Two primaries in one view means it has no hierarchy. A
dialog is a view of its own, so its confirming button can be primary too.

```
Showing where something is up to?
 ├── In a table or list → Status (dot)
 ├── On a card or beside a heading → Status variant="badge"
 ├── A label the user can add or remove → TagGroup with Tag
 └── A reply or suggestion to tap → Chip in a ChipGroup
```

## References

Load the one the task needs:

| File | Covers |
| --- | --- |
| [tokens.md](references/tokens.md) | Colour roles, type, space, corners and shadows, with a flowchart per role |
| [actions.md](references/actions.md) | Button, Link, Menu, ToggleButtonGroup, Toolbar, Chip, Keyboard |
| [forms.md](references/forms.md) | Fields, choices, dates, colours, files, search |
| [overlays.md](references/overlays.md) | Modal, Drawer, Popover, Tooltip, Toast |
| [collections.md](references/collections.md) | Table, GridList, List, Card, ListBox, Tabs, TagGroup, navigation, pagination |
| [feedback.md](references/feedback.md) | Status, Alert, EmptyState, progress, Avatar |
| [content.md](references/content.md) | Prose, Quote, Aside, Code, Disclosure, Separator, chat |

Each component's props and what it's built on are also in the Loupe preview, beside its stories.
