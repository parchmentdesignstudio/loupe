# tokens

Colour, length, number and string tokens, one file per type. Parchment's values live in packages/ui/tokens.css. colors.elyx, colors-dark.elyx, typography.elyx, typography-coarse.elyx, lengths.elyx and fonts.elyx are written from it by `pnpm elyx:tokens`, so change the CSS and run that rather than editing them. `pnpm test` fails when they're out of date.
