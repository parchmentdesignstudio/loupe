import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar } from './Avatar.js';
import { tv } from './tv.js';
// The quote class is in tokens.css, beside prose's blockquote, which it shares its rules with. A testimonial starts from
// it and sets the words smaller and from the start edge, with the person under them, as utilities win over the class.
// No before: utilities here: each sets content to Tailwind's empty one, which wipes out the opening mark
export const quote = tv({
    slots: {
        base: 'quote',
        words: '',
        caption: '',
        person: 'block',
    },
    variants: {
        variant: {
            quote: '',
            testimonial: {
                base: 'text-start text-[length:1.25rem] leading-[1.3] text-pretty',
                caption: 'flex items-center gap-3',
                person: 'flex min-w-0 flex-col',
            },
        },
    },
    defaultVariants: { variant: 'quote' },
});
/** Someone else’s words, set apart in Livory’s italic, with who said it under them. A testimonial puts their photo beside their name */
export function Quote({ children, cite, detail, variant, avatar, className, ...props }) {
    const styles = quote({ variant });
    const hasCaption = cite != null || detail != null;
    return (_jsxs("figure", { ...props, className: styles.base({ className }), children: [_jsx("blockquote", { className: styles.words(), children: children }), hasCaption && (_jsxs("figcaption", { className: styles.caption(), children: [variant === 'testimonial' && avatar != null && _jsx(Avatar, { name: typeof cite === 'string' ? cite : '', src: avatar, size: 48, "aria-hidden": true }), _jsxs("span", { className: styles.person(), children: [cite != null && _jsx("cite", { children: cite }), detail != null && _jsx("span", { children: detail })] })] }))] }));
}
