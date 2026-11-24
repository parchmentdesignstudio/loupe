# Overlays

```
What needs to show over the page?
 ├── A name for an icon button, on hover and focus → Tooltip
 ├── Actions or a choice from a button → Menu
 ├── A small form or detail beside what opened it → Popover holding a Dialog
 ├── A task that must be finished or cancelled first → Modal holding a Dialog
 ├── Detail or settings beside the page, which stays in view → Drawer
 └── News about something that just happened → Toast
```

## Tooltip

A short name for a control, in a `TooltipTrigger` with it. Every icon-only Button gets one, and its text matches the
button's `aria-label`. Never put links or buttons in a tooltip, as it can't be reached: that's a Popover.

## Modal and Dialog

`<DialogTrigger>` holds the Button and the `Modal`, which holds a `Dialog`. The Dialog has a `DialogHeading` (or an
`aria-label`), then its content, then `DialogActions` with its buttons.

Sizes: `medium` (the default) for a confirmation or a short form, `large` for a long form. `small` only holds a sentence
with one-word buttons, such as Remove and Cancel, as two buttons that say what happens fill it.

- In `DialogActions`, the confirming button is last. Cancel is `secondary` with `slot="close"`.
- The confirming button is `primary`, or `danger` if it deletes. Its label says what happens, such as "Delete lead".
- `DialogClose` is the corner's close button, for a dialog with no Cancel.
- To close after the action, take `close` from the Dialog: `<Dialog>{({ close }) => …}</Dialog>`.
- Opened from somewhere other than its Button, such as a menu item or an empty state's action: control it with
  `isOpen` and `onOpenChange`, on the DialogTrigger, or on a Modal on its own with no trigger.
- `isDismissable` for confirmations and dialogs that only show something. Never for a form, where a stray click
  would lose what's typed.
- Text in the dialog is `text-body`; set it on the paragraph.

```tsx
// Correct
<DialogTrigger>
	<Button variant="danger">Delete lead</Button>
	<Modal>
		<Dialog>
			{({ close }) => (
				<>
					<DialogHeading>Delete REF-0256?</DialogHeading>
					<p className="text-body">Its calls and notes go with it.</p>
					<DialogActions>
						<Button variant="secondary" slot="close">Cancel</Button>
						<Button variant="danger" onPress={() => { remove(); close(); }}>Delete lead</Button>
					</DialogActions>
				</>
			)}
		</Dialog>
	</Modal>
</DialogTrigger>

// Incorrect: a vague confirm, and the buttons in the wrong order
<DialogActions>
	<Button variant="primary">OK</Button>
	<Button>Cancel</Button>
</DialogActions>
```

## Popover

Content beside what opened it, such as a small form, in a `DialogTrigger`. It holds a Dialog, which pads 16px here.

## Drawer

Slides in from an edge, in a `DrawerTrigger` with its Button. Modes: `overlay` (the default: over the page, dimmed)
and `push` (moves the page aside so it stays in view, as Loupe's own settings do). Use `push` when someone works
between the drawer and the page; below its `pushFrom` width it becomes an overlay anyway.

## Toast

For something that just happened, which needs no action, such as "Lead saved". Make one `ToastQueue` for the app,
in a module of its own, render `<ToastRegion queue={queue} />` once at the app's root, and call
`queue.add({ title: 'Lead saved' })` from anywhere. `action: { label: 'Undo', onAction }` adds a button. A toast that offers Undo keeps it short. An error the user must fix is an Alert or a
field's error, not a toast, as a toast goes before it can be read.
