---
name: product-design
description: Product and form UX rules for interfaces built with Loupe or anything else. Use when building or reviewing a form, a submit or send button, a composer, a dialog's actions, a settings page, or any control that can't act yet. Above all, buttons are never disabled; the interface answers a press with feedback instead. Triggers on isDisabled, disabled, aria-disabled, submit button, send button, can't submit, greyed out, form validation, empty field, required field, loading button, double submit.
---

# Product design

## Buttons are never disabled

A disabled button is a dead end. It doesn't say why it won't work, it can't be focused, so a screen reader may never
reach it, and its faded look reads as broken. Leave every button live, and when pressing it can't do what it says, answer the press.

```
Pressed, but it can't act yet?
 ├── Something's missing or wrong in a form → submit anyway, validate, show each error by its field and move focus
 │   to the first
 ├── An empty message or search → focus the field, so its ring shows where to write, with a short shake
 ├── The action's already running → isPending: it spins, stays focusable, and a second press does nothing
 ├── Waiting on something else, such as a choice above → say what it's waiting on in words, by the button or in a
 │   Toast when pressed
 └── The action doesn't apply here at all → don't render the button; nothing beats a dead one
```

```tsx
// Correct: always live, and an empty message says so
<Button type="submit" aria-label="Send">…</Button>

// Incorrect: the user presses, nothing happens, and nothing says why
<Button type="submit" aria-label="Send" isDisabled={message.trim() === ''}>…</Button>
```

- Feedback is immediate and points at the cause: focus the field that needs fixing, never only a message at the top.
- A shake or nudge is 200–300ms and only moves, with `translate`. With reduced motion, focus alone does the job.
- `isPending` is not disabled. It keeps focus, says busy to a screen reader, and guards against a double submit
  itself, so don't add `isDisabled` beside it.
- A whole field that can't change here is `isReadOnly`, which still shows and reads its value. A form that's
  submitting keeps its fields as they are.
- When reviewing, treat every `isDisabled`, `disabled` or `aria-disabled` on a button as a bug unless the comment above
  it says why it can't be one of the answers above.

### Worked example

The chat's Composer used to grey out Send until something was written. Pressing it did nothing. Now Send is always the
marigold button: with nothing written it focuses the field and shakes it, so the next keystroke lands in the right
place. The "New conversation" button was disabled on an empty chat. With nothing to start over from it doesn't apply,
so it's no longer rendered until there's a conversation.
