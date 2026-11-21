# Forms

Every field takes `label`, `description` and React Aria's validation, which shows the error under it. Never put a
`<label>` or error text beside a field yourself, and never use a placeholder as the label.

## Which field

```
What is the value?
 ├── Text → TextField (isMultiline for more than a line)
 ├── A search → SearchField
 ├── A number → NumberField (formatOptions for currency, percent, units)
 ├── A number in a range, felt rather than typed → Slider
 ├── One of a list
 │    ├── Up to 5, short, always visible → RadioGroup
 │    ├── 6 to 15 options → Select
 │    └── More than 15, such as clients or countries → ComboBox
 ├── Several of a list → CheckboxGroup, or TagGroup with selectionMode
 ├── On or off
 │    ├── Takes effect straight away → Switch
 │    └── Saved with the form → Checkbox
 ├── A date → DatePicker (DateField if a calendar won't help, DateRangePicker for two)
 ├── A time → TimeField
 ├── A colour → ColorPicker; a few set colours → ColorSwatchPicker; a typed colour → ColorField
 └── Files → DropZone with a FileTrigger inside, and a FileList under it
```

## Variants

TextField, NumberField, Select and ColorField share them. Variants: `raised`, `filled`. Sizes: `medium` (32px),
`small` (28px). Nothing else exists.

- `raised`, white with a lift: a form on a page. The default.
- `filled`, flat and grey: a dense panel of settings, as a design tool's inspector is.
- `small`: inspectors, tables and toolbars. Keep one size within a form.

Don't mix `raised` and `filled` in one form.

```tsx
// Correct
<form className="flex flex-col gap-4">
	<TextField label="Name" isRequired />
	<Select label="Developer" items={developers}>{(item) => <ListBoxItem>{item.name}</ListBoxItem>}</Select>
	<Button type="submit" variant="primary">Save lead</Button>
</form>

// Incorrect: a placeholder for a label, a hand-built input, and margins instead of gap
<input className="mb-3 rounded border px-2" placeholder="Name" />
```

## Saving

Preferences and settings apply as they change: Switches, Selects and fields that save on change, a Toast to say
so, and no Save button. That's the default for a settings screen, and why a "toggle" there is a Switch. A form
that's sent as a whole, such as a new lead, has Checkboxes and a Save button. Don't mix the two in one screen.

## Values

The fields are React Aria's, with its prop names:

- TextField, NumberField, SearchField, Slider, Switch, Checkbox, the date and colour fields: `value` and `onChange`,
  or `defaultValue`.
- CheckboxGroup: `value` as a `string[]` of its Checkboxes' `value`s. RadioGroup: `value`, the chosen Radio's.
- Select and ComboBox: `selectedKey` and `onSelectionChange`, matched to each ListBoxItem's `id`. Pass `items` with
  an `id` on each, and render `<ListBoxItem>` for each.
- Menus, tables, tags and lists that choose: `selectedKeys` and `onSelectionChange`, which gets `'all'` or a `Set`. Dates and times are
`@internationalized/date`'s `CalendarDate` and `Time`, imported from there, and shown in the user's locale.

## A form in a dialog

The `<form>` goes inside the Dialog and holds everything, DialogActions included, so the confirming Button is
`type="submit"` and Enter submits. Its `onSubmit` closes the dialog once it's saved.

## Rules

- Field labels are short nouns in sentence case: "Email address", not "Please enter your email address".
- Error text says how to fix it: "Enter an email address with an @", not "Invalid".
- The submit button names what it does, "Save lead", never "Submit". It's `primary` if it's the view's action.
- Forms stack fields with `gap-4`. Two short fields can share a row in a `grid grid-cols-2 gap-4`.
- `isReadOnly` keeps a field's edge and drops its fill, for a value that can't be changed here. `isDisabled` is for
  one that can't be changed yet, never for a button: a submit stays live and answers with errors by its fields. See
  the [product-design](../../product-design/SKILL.md) skill.

## Choices

- `Checkbox` with its label as children. Several under one label in a `CheckboxGroup`.
- `RadioGroup` with `Radio` children; `orientation="horizontal"` for two or three short ones.
- `Switch` with its label as children. `shape="full"` only where the design has pill switches throughout.

## Files

`DropZone` (variants `dashed`, the default, and `quiet` for a zone that fills its panel) with a `FileTrigger` holding a
`Button variant="secondary"`. Show the files in a `FileList` under it; each `FileListItem` has a `status` of
`uploading`, `done` or `failed`.
