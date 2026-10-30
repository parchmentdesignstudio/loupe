// Parchment's tv(), with the merge taught the tokens' class names. Otherwise it reads
// text-body (a size) and text-ink (a colour) as the same thing, and drops one
import { composeRenderProps } from 'react-aria-components';
import { createTV, extendTailwindMerge } from 'tailwind-variants/config';
const twMergeConfig = {
    extend: {
        theme: {
            text: ['body', 'label', 'title'],
            shadow: ['raised'],
        },
    },
};
export const tv = createTV({ twMergeConfig });
const merge = extendTailwindMerge(twMergeConfig);
/** The focus ring every control shares, shown for keyboard focus only, through React Aria's isFocusVisible */
export const focusRing = tv({
    base: 'outline-offset-2 outline-ink forced-colors:outline-[Highlight]',
    variants: {
        isFocusVisible: {
            false: 'outline-0',
            true: 'outline-2',
        },
    },
});
/** A className prop, a string or a function of React Aria's render props, merged over a component's own classes */
export function composeClassName(className, own) {
    return composeRenderProps(className, (given) => merge(own, given));
}
