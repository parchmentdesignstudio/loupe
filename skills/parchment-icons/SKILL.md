---
name: parchment-icons
description: Draw, name, refine and ship icons for @parchment/icons (Loupe's packages/icons), especially the 16px solid set drawn in Sketch. Use when adding an icon, drawing a solid version of a line icon, reviewing or refining icon shapes, naming or renaming icons, or exporting from Sketch and building the package. Triggers on icon, icons, solid icon, line icon, glyph, @parchment/icons, packages/icons, Sketch icon, keylines, building blocks, SF Symbols name.
---

# Parchment icons

`@parchment/icons` lives in the Loupe repo at `packages/icons`. It has two styles at 16px (and line at 24px):

- **Line**: 2px strokes, from iamsteve.me, in `source/line/16`.
- **Solid**: filled shapes drawn in the Sketch file's `solid` page, exported to `source/solid/16`.

`pnpm -s build` in `packages/icons` turns `source/` into `svg/`, the sprite, `icons.json` and `data.js`. Never edit `svg/` or `sprite/` by hand.

## The solid set is the refined one

Line icons are 2px strokes, so they fill a lot of their box on weight alone. A solid icon should feel **lighter and more considered** than its line twin, not a filled-in, inflated copy of it.

- Never fill or offset a line icon's stroke outline to make the solid. It comes out heavier than the line version.
- Reach for 1.5 bars, 1px details and knockouts before big masses. Use a solid silhouette when the object is a solid thing (a box, a document, a disc). When the glyph is a drawing of lines (⌘, arrows, a curve with handles), draw it at 1.5 and keep it open.
- Big discs and blobs read as heavy. Make loops into rings, and put the cutout inside.
- Check the result beside the line version at 1×. The solid should look quieter, not bolder.
- Don't leave awkward leftover shapes, such as slivers or vase-like fragments where two shapes were subtracted. If a cut leaves a fragment, redraw rather than patch.
- Keep things symmetrical where the object is (wings, arrows, loops), and mirror rather than redraw.

## Rules from the Practice artboard

These are the patterns in the drawn icons: a 1.5px base, optically adjusted.

1. Bars, rays, dots and walls are 1.5px.
2. Details and small parts are 1px: text lines, small marks, handles.
3. Decorative cutouts and gaps between shapes are 0.75px (the briefcase seam).
4. Cutouts that carry the meaning are 1.25px (the checkbox tick). Text lines are 1px.
5. Round cutouts are 2.5px, 1.5px apart.
6. Corners: 0.5 on 1.5px, 0.375 on 1.25px, 0.25 on 1px (a 0.5 flat end).
7. Outer corners are 1. Inner corners of holes are 0 (the outer corner minus the wall).
8. Containers fill a keyline: 12 square, 14×10 wide, 10×14 tall, 14 round.
9. Only rays and rotated parts pass the live area (1–15), and by no more than 0.25.
10. Repeats: lines 1.5 with 1.5 between, dots 2.5 with 1.5, dashes 1.5 with 1.
11. Tones: main 100%, secondary 60%, area fills 20%, screens white at 60%.
12. Quarter-pixel grid. Bars are centred on 8 (7.25–8.75).
13. Suns: disc radius 4, rays and dots centred 6 from the middle.

Also see the **Building blocks** artboard. Hands, prompts, bars and other inner shapes start there: 1.5px bars with 0.5 corners, and angles with a 0.5 outer corner and a sharp inner one, rather than fully rounded ends.

### Corners scale with their angle

The radii in rule 6 and rule 7 are for right angles. A fixed radius reads differently at other angles: nearly sharp on a wide corner, blunt on a narrow tip. Keep the rounding the same width to the eye by scaling the radius to the corner:

`radius = base × 0.7071 ÷ cos(angle ÷ 2)`, rounded to the nearest 0.125.

`base` is what the corner would take at 90° (0.5 on a 1.5 part or a pointed tip, 1 on an outer corner), and `angle` is the corner's inside angle.

| Inside angle | From a base of 0.5 | From a base of 1 |
|---|---|---|
| Up to 60° (star tips, a flame, a pencil point) | 0.375 | 0.75 |
| 90° | 0.5 | 1 |
| 120° | 0.75 | 1.5 |
| 150° | 1.375 | Draw it as a curve |

- Small parts keep their own base: tips on a 1px part or a small star still take 0.25.
- Decorative cuts stay sharp where they meet an edge (the briefcase seam, the globe's lines).
- Judge the result at 1×. The table is a starting point, not a substitute for looking.
- Leave shipped icons as they are unless asked. `moon` keeps 0.5 on its narrow tips.

### Checkmarks

A checkmark is the angle block turned 45°, with the corner at the bottom, the short arm up to the left and the long arm up to the right. The long arm is 1.875 times the short one. Pick the block by the space it has, and don't scale one to fit:

| Block | Stroke | Short arm | Long arm | Corners | Size | For |
|---|---|---|---|---|---|---|
| `checkmark-base` | 1.5 | 6 | 11 | 0.5 | 11.6 × 8.4 | The mark on its own (`checkmark`) |
| `checkmark-medium-base` | 1.5 | 4 | 7.5 | 0.5 | 7.7 × 5.9 | Inside a 12 or 14 container (`checkmark-circle`) |
| `checkmark-small-base` | 1.25 | 3.25 | 6 | 0.375 | 6.2 × 4.8 | Badges and cutouts (`clipboard-badge-checkmark`) |
| `checkmark-mini-base` | 1 | 2 | 3.75 | 0.25 | 3.9 × 3.2 | Rows of a list (`checklist`) |

Arms are measured along the outer edge of the angle, before turning. The inner corner stays sharp. Each block sits on the Building blocks artboard twice: as two bars (`-grouped`) and as one live polygon.

Below 1.25 the short arm is too short to hold a 1.25 stroke, and it turns into two blobs. That's what broke `checklist`, so use the mini block at 1px there.

Before drawing, read the rules again from Sketch, since they may have moved on: the text layers on the `Practice` artboard of the `solid` page.

## Tones in Sketch

The build recolours by lightness, so mark tones like this:

| Tone | In Sketch | Built as |
|---|---|---|
| Main | `#092e24`, layer `fill` | `currentColor` |
| Secondary | `#092e24` at 60% layer opacity, layer `fill-opacity-60` | `opacity=".6"` |
| Area fill | White fill, full opacity | `currentColor` at `.2` |

Look at a sibling: `square-on-square` for secondary, `display` for a screen.

## Naming

Name an icon for **what it draws, not what it's for**, in SF Symbols style with dots as hyphens: `magnifyingglass`, `archivebox`, `arrow-up-forward-app`, `square-on-square-badge-checkmark`. Long SF names are fine, such as `arrow-up-left-and-down-right-and-arrow-up-right-and-down-left`.

- A glyph has the **same name in line and solid**. Rename both together, never just one.
- Purpose names (`blog`, `category`, `design`, `views`, `external`) are the old convention. Purposes go in `terms.js` as search terms, not in the name.
- Before adding a name, check it isn't a near-duplicate of one already there. When it is, drop it from every set and size, and add its old name to the survivor's terms. `category` is `folder`, `design` and `blog` are `pencil-tip` (the pen tool), and `font-outline` is `font`. Duplicates were also removed in the rename commit (2ec8099), so don't bring them back.
- Renaming or removing an icon is a breaking change for the sites that use it, so ask before doing it and note it for the version bump. Keep `terms.js` keys and `WANTED.md` in step with any rename.

## Workflow

1. **Find the gaps.** Compare `ls source/line/16` with `ls source/solid/16`. In Sketch, each icon is a group named `solid/16/<name>` holding a `Keylines` group and a `fill` group. Empty slots only hold `Keylines`. Some names have two slots, so prefer the empty one.
2. **Look at siblings first.** Render the line version and the nearest solid relatives beside each other: `sed 's/currentColor/#092e24/g' svg/<style>/16/<name>.svg | rsvg-convert -w 64 -h 64 -b white`, and `magick montage` to compare. Match their keylines, corner radii and weight.
3. **Draw with paper.js.** Copy `scripts/shapes.cjs` from this skill into a scratch folder, run `npm i paper paperjs-offset` there, and build shapes with its helpers:
   - `rr` makes a rounded rectangle, `disc` a circle, `U` a union and `S` a subtraction.
   - `rpoly` gives each corner its own radius, `bar(x1, y1, x2, y2)` draws a 1.5 bar with 0.5 corners, and `arc` draws a banded arc with round ends.
   - `offset` makes the 0.75 gaps around a shape, `mirrorX` and `mirrorY` mirror one, and `tint` marks the secondary tone.

   For organic shapes, such as a phone handset, don't stack `offset` passes, as they go ragged. Build the outline directly instead:
   - Sample the outer and inner edges along a centre curve from a width profile, using smoothstep to swell into the ends.
   - Add half-circle caps, start the path mid-curve, and `simplify(0.006)`.
   - Recentre it on the box afterwards.

   Write a preview SVG of every icon on a pink 16×16 cell, render it with `rsvg-convert`, and look before going further. Iterate until it passes the refinement checks above.
4. **Place in Sketch** with `mcp__sketch__run_code`. Scripts can't read local files, so paste the path data in. For each icon:
   - Remove everything except `Keylines` from its slot.
   - Add `sketch.ShapePath.fromSVGPath(d)` layers inside a new `sketch.Group({ name: 'fill', parent: slot, layers })`, then call `adjustToFit()`. Fill them with `#092e24ff` and no border.
   - For a missing slot, duplicate an existing slot, keep only its `Keylines`, and place it 32px right of the last slot on its neighbour's row. Widen the artboard if it needs to.

   Things the API does that trip you up:
   - Emptying a group deletes it, so make a new one.
   - Assign a whole `frame` (Rectangle). Mutating `frame.x` doesn't stick.
   - Setting `pointType = 'Straight'` flattens curves.
   - A script that throws rolls back its changes.
5. **Export**: `sketch.export(slots, { formats: 'svg', output, overwriting: true })` writes `solid/16/<name>.svg`. Strip the keylines with `perl -0pe 's/\s*<g id="Keylines".*?<\/g>//s'` and copy the result into `source/solid/16/`.
6. **Build** with `pnpm -s build`, then render the built `svg/line/16` and `svg/solid/16` pairs side by side as the final check. Make sure every new name has an entry in `terms.js`.
7. Remind the user to **save the Sketch file**. Don't commit, push or release unless asked. Release branches are never deleted.
