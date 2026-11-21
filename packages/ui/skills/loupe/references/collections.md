# Collections

```
What is the list?
 ├── Records with several fields to compare, such as leads or invoices → Table
 ├── Items to choose or act on, each with its own buttons → GridList (layout="grid" for tiles)
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
- References and codes: `font-mono`.
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
