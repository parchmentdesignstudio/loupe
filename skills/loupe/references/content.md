# Content

## Which one

```
What is it?
 ├── Writing at length, such as a post from Markdown → Prose
 ├── Someone else's words → Quote
 ├── The writer's own aside beside the text → Aside
 ├── Code → Code
 ├── Detail to open and close → Disclosure
 ├── A line between groups → Separator
 └── A conversation → MessageList, Message, Composer, Suggestions
```

## Prose

Plain HTML at length, set in Loupe's type, with no classes inside. Wrap the rendered Markdown in it and don't style
its children. Keep its column to 40rem (`max-w-160`), as Loupe's docs pages do.

## Quote

Variants: `quote` (the default) and `testimonial` (the person's photo beside their name). It sets the words in
Livory's italic, the only place `font-serif` is used.

## Aside

Variants: `signpost` (the default: what the reader should know first, such as "I assume you've set up Tailwind")
and `afterthought` (an aside after the point). Not for warnings, which are an Alert.

## Code

A highlighted block with a title and Copy. Long code scrolls inside it. In a sentence, inline code is a `<code>` in
Prose, not this.

## Disclosure

A `DisclosureHeader` that opens its `DisclosurePanel`. Several in a `DisclosureGroup` open one at a time unless
`allowsMultipleExpanded`. Sizes: `medium` for questions and answers, divided by lines; `small` for navigation, or a
title over its description.

## Separator

A line between groups of controls or sections of a panel. Not between rows of a list or table, which draw their own.

## Chat

`MessageList` holds `Message`s, oldest first; each is `from="user"` or `from="assistant"`. `Composer` is the field and
send button under them: Enter sends, Shift-Enter starts a line. `Suggestions` holds `Suggestion`s to ask, with
variants `starter` (before the first message) and `follow-up` (after a reply).
