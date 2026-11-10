# components

Reusable pieces: buttons, inputs, cards and list rows. Code components from @ui/components/* can be wrapped here.

elevation.elyx is written from packages/ui/tokens.css by `pnpm elyx:tokens`: a frame per shadow, with the fill it goes with and its corners bound to lengths.elyx. Instance one rather than copying its shadow. CSS paints a shadow's first layer on top and Elyx its last, so the layers are in the opposite order to the CSS. Give the instance a layout that isn't the default, such as `layout.align-items: .center`, as normalize drops a default one and the instance collapses.

text.elyx is written the same way: a text layer per text style, with its size, leading and family bound to the tokens, so it follows the coarse pointer. Instance one rather than setting a size, then set its contents, and its weight where the caption says. Control text sits on a 20px line with either pointer, so 6px padding above and below makes a control 32px tall, as in code.
