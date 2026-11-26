# Collections

```
What is the list?
 ├── Records with several fields to compare, such as leads or invoices → Table
 ├── Items to choose or act on, each with its own buttons → GridList (layout="grid" for tiles)
 ├── Things to read, one under another, nothing to press → List
 ├── A few things of one kind side by side, such as plans or stats → Card, in a grid
 ├── Options to pick from, in a Select or ComboBox → ListBox (they hold their own)
 ├── Labels to add, remove or choose → TagGroup
 └── Pages of a site or tool → NavigationTree in Navigation
```

## Table

`Table` > `TableHeader` with a `Column` each, and `TableBody` with `Row`s of `Cell`s. Set `isRowHeader` on the
column that names each row. Give the Table an `aria-label`. For data, pass `items` to TableBody and render a `Row`
for each, with its `id`. A Table is its own box, so it never goes in a card.

Variants: `raised` (the default: one box among other things on a page) and `flush` (no box, for a table that is the
page's subject, with only a header and filters above it, as the leads screen's is). Density: `comfortable` (40px rows, the default) and `compact` (32px, for
many columns or rows). Nothing else exists.

- Numbers and amounts: `align="end"` on the Column and its Cells, with `tabular-nums`. Dates stay at the start,
  with `tabular-nums`.
- References and codes: `font-(family-name:--typeface-mono)`.
- Status: a `Status` dot in its own column, never a coloured word.
- Row actions: `RowActions` in the last cell, holding MenuItems. Not a row of buttons.
- No rows: `renderEmptyState={() => <EmptyState … />}` on TableBody, alongside `items`.
- The actions column has no name to show: `<Column id="actions" aria-label="Actions" width={52} />`, and `RowActions`, with an
  `aria-label`, in its Cell.
- More than a page: `Pagination` under the table, or `TableLoadMoreItem` to load as it scrolls.

```tsx
// Correct
<Column id="value" align="end">Value</Column>
<Cell className="tabular-nums">£24,500</Cell>
<Cell><Status tone="success">Qualified</Status></Cell>

// Incorrect: a coloured word for a status, and numbers left-aligned
<Cell><span className="text-green-600">Qualified</span></Cell>
<Cell>£24,500</Cell>
```

## GridList

Items that hold buttons of their own, which a Table row or ListBox can't. `layout`: `stack` (rows, the default) or
`grid` (tiles). Give it an `aria-label`. Sections are `GridListSection` with a `GridListHeader` first.

## List

Things to read, one under another, such as an account's details or what a plan includes. Nothing in it is pressed
or picked: that's a GridList. Variants: `divided` (the default, a line between rows, to scan) and `plain` (no lines,
for short points). Nothing else exists. Each `ListItem` takes an `icon` before it, a `description` under it and an
`end`, such as an amount or a Status, which is drawn with tabular figures. Give the List an `aria-label` when nothing
on the page names it.

```tsx
// Correct: a plan's points, with a tick each
<List variant="plain">
  <ListItem icon={<Icon name="checkmark" />}>Unlimited projects</ListItem>
</List>

// Incorrect: lines of Text, or a GridList for things nobody presses
<p>✓ Unlimited projects</p>
```

Figures that add up, such as an invoice's lines, go above their total. Anything already counted in it, such as VAT
included, goes under the total as `text-muted` text, so it doesn't read as one more to add.

## Card

One of a few things side by side, such as plans or stats, in a `grid` with `gap-3`. Never a section on its own, and
a Table never goes in one. Fills: `raised` (the default, white off the page) and `quiet` (for cards inside something
raised). Nothing else exists. Its `title` is a heading (`headingLevel`, 3 by default), `figure` a stat's number grouped with it, `description` a line under them,
`children` what it holds, and `actions` its buttons, pinned to the foot so a row of cards lines them up. One card in a
row may have the primary Button, as the plan to pick; the rest are secondary.

```tsx
<Card title="Team" description="For small teams" actions={<Button variant="primary">Start free trial</Button>}>
  <p className="text-title">£12</p>
  <List variant="plain">…</List>
</Card>
```

A stat is a Card with a `figure`. The title and figure read as one, a label and its value, so they sit 4px apart; the
`description` is about the figure, the change, so it stands 24px under it. Nothing else goes in a stat card. A figure
takes proportional figures, which sit as tight as a heading; `tabular-nums` is for figures in a column.

```tsx
// Correct
<Card title="Revenue" figure="£18,430" description="Up 12% on last week" />

// Incorrect: the change sits above the figure, and the figure is as loose from its title as anything else
<Card title="Revenue" description="Up 12% on last week">
  <p className="text-title">£18,430</p>
</Card>
```

## Tabs

Panels of content, one at a time, sharing a page: `Tabs` > `TabList` (with an `aria-label`) of `Tab`s, then a
`TabPanel` for each with the same `id`. A Tab with `href` is a link, for tabs that are pages, as the leads screen's
"All, New, Call arranged…" are. Switching how one thing is shown, rather than which thing, is a ToggleButtonGroup.

## TagGroup

Tags under one label. `onRemove` gives each a remove button; `selectionMode` lets them be chosen as filters. Not for
status, which is Status.

## Navigation

- `Navigation` is the page's column of links, a drawer on phones. It holds a `NavigationTree` with
  `NavigationTreeSection`s; the item whose `href` matches `selectedRoute` is the current page.
- `Breadcrumbs` with a `Breadcrumb` each, for where a page sits. The last is the current page, as text.
- `Pagination` for a long list's pages; it folds the far ones into a menu.
