# Tokens

Every value lives in `styles/theme.css` as a Tailwind theme variable, so each is a utility: `--color-raised` is
`bg-raised`, `--text-label` is `text-label`, `--radius-lg` is `rounded-lg`.

There are three layers, and only the first is for components and pages:

1. **Roles**, such as `ink`, `raised`, `edge`. Use these.
2. **Palette**, such as `pine-26`, `marigold-83`. Never in a component. A palette step is one colour in both themes,
   so it breaks the dark mode. The only exception is a brand illustration that is meant to be that exact colour.
3. **Raw values**, such as `#fff`, `13px`, `shadow-[0_1px_2px…]`. Never.

## Which background

```
What is it?
 ├── The page itself → bg-ground
 ├── An area on the page, such as a side panel → bg-panel (a card is a Card, which sets its own)
 ├── A control's fill → bg-raised (components already do this)
 ├── Something that floats: menu, popover, dialog, drawer → bg-overlay (the component sets it)
 ├── Ink as a surface, such as a toast or tooltip → bg-inverse with text-paper
 ├── Marking something out behind ink → bg-highlight
 └── A tint on whatever it sits on, such as a hover or a line → bg-bleed/4, /8, /12, /16, /24 or /32
```

Tints use only those six strengths, so `bg-bleed/8`, never `bg-bleed/10`. Each layer sets its own `--bleed`, so a
tint suits what it sits on without picking a colour.

## Which text colour

```
 ├── Most text → text-ink (the default, don't set it)
 ├── Secondary text, meta, placeholders → text-muted
 ├── An error message → text-danger
 ├── On bg-inverse → text-paper
 └── On a primary or quiet fill → text-on-primary, text-on-quiet
```

`accent` and `primary` are the same marigold. `accent` marks the current page or today; `primary` is a primary
button's fill. Don't use either for text: marigold doesn't pass contrast on linen.

## Type

| Utility | Size / line | For |
| --- | --- | --- |
| `text-title` | 20 / 22px, bold | A page or section heading |
| `text-body` | 14 / 20px | Reading text |
| `text-control` | 13 / 20px | Inside buttons, fields, options, tabs. 16px on touch screens, so iOS doesn't zoom |
| `text-label` | 12 / 16px | Labels, column headers, meta, badges |

These four are all there is. Don't use Tailwind's `text-sm`, `text-lg` and so on, and don't add weights: `title` is
bold and the rest are regular, with `font-medium` for a label that names a group. Fonts are `font-sans` (Elza Round),
`font-mono` for code and references such as `REF-0256`, and `font-serif` only through Quote. Long writing goes in
Prose, which sets its own type.

## Space

Tailwind's spacing steps, which are 4px each: `1` is 4px, `2` 8px, `3` 12px, `4` 16px, then `5`, `6`, `8`, `10`,
`12`, `16`. Half steps (`0.5`, `1.5`, `2.5`, `3.5`) only up to 16px. No arbitrary values.

- Inside a group of controls: `gap-2`. Between fields in a form: `gap-4`. Between sections: `gap-8` or `gap-10`.
- Page padding: `px-4` on phones, `md:px-10` wider.
- Size bars by padding round their content, not a fixed height. A control is 32px because its 20px line has 6px
  above and below; set `py`, not `h-8`.

## Grouping

Space says what belongs together, so a layout needs no lines or boxes to be read. There are three distances, and each
is at least twice the one inside it; closer than that and two levels read as one.

| Distance | Space | For |
| --- | --- | --- |
| Within a unit | 4–6px (`gap-1`, `gap-1.5`) | A field's label, box and help; a stat's title and figure |
| Between units | 16px (`gap-4`) | Fields in a form, settings in a list, cards in a grid |
| Between groups | 32–40px (`gap-8`, `gap-10`) | Sections of a page |

A part that is read after the unit, rather than with it, stands apart from it at 24px (`gap-6`): a stat's change sits
under its figure that way, as a second reading of the number. Help that says how to fill a field is part of the
field, so it stays at the field's gap.

Judge a gap by the letters, not the boxes. A line of text carries half its leading above and below its letters:
`text-control` (13 on 20) 3.5px each side, `text-label` (12 on 16) 2px, `text-title` (20 on 22) 1px. Large type
also has room inside its own letters, above the capitals. So:

- Parts of a unit share a type role where they can, so the same gap looks the same above and below. A field's label
  and help are both `text-control` for that reason.
- Text under an edge looks further from it than text over it, as its capitals leave room above them that descenders
  don't below. So a field's help sits 4px under its box, where the label sits 6px over it, and the two look equal.
- Large type on a tight line needs less gap than small type to look as close. A stat's 28px figure sits 4px under
  its title, where a field's box sits 6px under its label.
- Every field in a form uses the same gap, so the labels line up when two share a row.

## Corners

`rounded-sm` 4px, `rounded-md` 6px, `rounded-lg` 8px, `rounded-xl` 12px, `rounded-3xl` 24px, and `rounded-full`.
Most things are `rounded-lg`. A corner inside a rounded container is the container's radius less the space between
them, so the curves stay parallel: a 4px inset in an 8px box rounds to 4px. Dialogs and drawers are 24px, set by the
components.

## Shadows

Use the levels, never a shadow of your own. Each is built from parts (light, rim, depth) that turn to their dark
mode on their own.

| Utility | For |
| --- | --- |
| `shadow-raised` | Something that sits on the page and can be pressed, such as a card that's a control |
| `shadow-panel` | A card or panel that holds things |
| `shadow-button` | Set by Button. Don't add it to anything else |
| `shadow-floating` | A floating toolbar |
| `shadow-overlay` | Set by Popover, Menu, Modal and Drawer |
| `inset-shadow-well` | A well that controls sit in, such as a track |

Borders are for separation, not depth: a line between rows is `border-b border-bleed/8`.
