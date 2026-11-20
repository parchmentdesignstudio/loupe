import { jsx as _jsx } from "react/jsx-runtime";
import { tv } from './tv.js';
// What a person sends sits in a tinted bubble at the end of the row, no wider than most of it, so a long one still
// reads as theirs. It grows up from its corner as it arrives. A reply is the page's own text, a column of paragraphs,
// lists or anything else, which fades up a beat after. Each arrives once, by @starting-style, so nothing replays as
// the conversation grows
export const message = tv({
    base: 'motion-reduce:transition-none',
    variants: {
        from: {
            user: 'max-w-[85%] origin-bottom-right self-end rounded-(--message-radius) bg-(--message-fill,var(--color-highlight)) px-(--message-padding-x) pt-(--message-padding-top) pb-(--message-padding-bottom) text-body text-pretty whitespace-pre-line text-ink transition-[opacity,translate,scale] duration-250 ease-spring rtl:origin-bottom-left starting:translate-y-2 starting:scale-96 starting:opacity-0',
            assistant: 'flex flex-col gap-3 text-body text-pretty text-ink transition-[opacity,translate] delay-75 duration-300 ease-out starting:translate-y-1 starting:opacity-0',
        },
    },
});
export const messageList = tv({ base: 'flex flex-col gap-(--message-list-gap)' });
/** One message in a conversation, from a person or the reply to them */
export function Message({ from, children, className }) {
    return _jsx("div", { className: message({ from, className }), children: children });
}
/**
 * The messages, oldest first. It's a log, so a screen reader reads out each one as it arrives, without moving to it
 */
export function MessageList({ children, className, ...props }) {
    return (_jsx("div", { role: "log", "aria-label": props['aria-label'], className: messageList({ className }), children: children }));
}
