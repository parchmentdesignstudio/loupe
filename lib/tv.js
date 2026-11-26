// Parchment's tv(), with the merge taught the tokens' class names. Otherwise it reads
// text-body (a size) and text-ink (a colour) as the same thing, and drops one
import { composeRenderProps } from 'react-aria-components';
import { createTV, extendTailwindMerge } from 'tailwind-variants/config';
const twMergeConfig = {
    extend: {
        theme: {
            text: ['body', 'control', 'label', 'title'],
            shadow: ['raised', 'button', 'button-lifted', ...['primary', 'quiet', 'danger'].flatMap((variant) => [`button-${variant}`, `button-${variant}-lifted`, `button-${variant}-bevel`]), 'floating', 'overlay', 'invalid'],
        },
    },
};
export const tv = createTV({ twMergeConfig });
const merge = extendTailwindMerge(twMergeConfig);
/**
 * The focus ring every control shares, shown for keyboard focus only, through React Aria's isFocusVisible. Set
 * data-show-focus on a control to show its ring without focus, as a preview or a screenshot needs. Where the ring is
 * on something inside, such as a checkbox's box or a field, that shows it
 */
export const focusRing = tv({
    base: 'outline-offset-2 outline-ink forced-colors:outline-[Highlight] data-[show-focus]:outline-2',
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
