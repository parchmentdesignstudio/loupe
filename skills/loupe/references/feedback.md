# Feedback

## Which one

```
What does the user need to know?
 ├── Where a record is up to → Status
 ├── Something about this page or part of it, there when it loads → Alert
 ├── Something that just happened → Toast (see overlays.md)
 ├── There's nothing here yet → EmptyState
 ├── How far along something is → ProgressBar, or ProgressCircle in the space of an icon
 ├── Something's on its way, with no telling how long, such as an answer → Scribble, beside words
 └── How much of a known limit is used, such as storage → Meter
```

## Status

Tones: `neutral` (the default), `info`, `success`, `warning`, `danger`. Variants: `dot` (the default, for tables and
lists) and `badge` (a tinted pill, for a card or beside a heading). Nothing else exists.

What the tones mean, so the same state gets the same colour everywhere:

- `neutral`: not started, inactive, archived.
- `info`: new, or in progress with nothing needed.
- `success`: done, delivered, paid.
- `warning`: waiting, or needs attention soon, such as pending or due today.
- `danger`: failed, bounced, overdue.

The colour only backs up the label, so the label must say it on its own: "Overdue", not just a red dot. Map each of
your states to a tone once, in one record, and use it everywhere:

```tsx
// Correct, from the leads screen
const tones: Record<LeadStatus, StatusTone> = { new: 'info', qualified: 'success', unresponsive: 'danger', … };
<Status tone={tones[lead.status]}>{names[lead.status]}</Status>

// Incorrect: a tone that doesn't exist, and colour with no words
<Status tone="green" />
```

## Alert

Tones as Status. Variants: `alert` (the default: a tinted box to draw the eye) and `notice` (a quieter line in the
flow, for something worth knowing that needn't stop anyone). `title` is a short line above the text; `actions` takes
small secondary Buttons; `onDismiss` adds a close button. The words say it's a warning, as the colour only backs
them up. Use one Alert per region at most.

## EmptyState

Where there's nothing to show yet. `title` says what will be here, the children say how to start, and `actions` holds
the first step as a Button. `icon` is an `<Icon />`.

```tsx
// Correct
<EmptyState icon={<Icon name="person" />} title="No leads yet" actions={<Button variant="primary">New lead</Button>}>
	Leads you add or import show here.
</EmptyState>

// Incorrect: says nothing about what to do
<p className="text-muted">No results</p>
```

A search with no results says what was searched and offers to clear it.

## Progress

- `ProgressBar`: an upload or a task. Without a value it's indeterminate. `valueLabel` for "3 of 8 files".
- `ProgressCircle`: the same in an icon's space; sizes `medium`, `large`. Give it an `aria-label`. A Button's own
  `isPending` already shows one, so don't add another.
- `Meter`: a quantity within limits, not progress.

Anything that takes longer than 400ms shows one of these.

## Avatar

A person as a `circle` (the default), an organisation or project as a `square`. Sizes: `20`, `24`, `32` (the
default), `48`, `64`. Always pass `name`, which gives the initials and the screen reader's name. `status` is
`online`, `away` or `busy`. Several overlap in an `AvatarGroup` with `maxVisible`.

## Scribble

A pen writing loops, for a wait with no telling how long, such as an answer being written. It's 23 by 16px, in the
text's colour, and hidden from screen readers, so it always sits beside words that say what's happening, in a
`flex items-center gap-2` row. `onPass` is called as each pass begins, to change those words with the pen. A wait
inside a button is ProgressCircle; a wait with a known end is ProgressBar.

```tsx
// Correct
<p className="flex items-center gap-2 text-muted">
  <Scribble />
  <TextEffect variant="ray" loop>Thinking</TextEffect>
</p>

// Incorrect: on its own, so a screen reader hears nothing
<Scribble />
```
