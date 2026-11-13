import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// oxlint-disable jsx-a11y/prefer-tag-over-role -- an avatar is a picture built from a tint and initials, so a span with
// role img, and a group of them isn't a form's fieldset
import { Children, createContext, isValidElement, useContext, useState } from 'react';
import { tv } from './tv.js';
// Each size sets --avatar-size, the corner a square takes (a quarter of the size, so a 32px square rounds as a button
// does), the status dot, and the initials' size. A circle's corner is half its size, and the dot reads the corner too
export const avatar = tv({
    slots: {
        // --avatar-ring is the colour of what it sits on, for the rings around a status dot and between avatars in a group.
        // Unset, it's the panel's. In a line of text it hangs from the line's top, so a 20px one fills a 20px line exactly
        // where middle would push the line a pixel or two taller
        base: 'relative inline-flex shrink-0 align-top',
        face: [
            'relative flex size-(--avatar-size) items-center justify-center overflow-hidden rounded-(--avatar-radius) bg-(color:--avatar-fill) font-medium text-(color:--avatar-text) select-none',
            'forced-colors:border forced-colors:border-[CanvasText]',
        ],
        // Over the initials, and see-through until it loads, so a slow or broken image never shows a broken icon or shifts anything
        image: [
            'absolute inset-0 size-full rounded-[inherit] object-cover opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none',
            // An image's edge, so a pale photo keeps its shape: black at 10% in the light, white in the dark, never a tint
            'outline-1 -outline-offset-1 outline-[color:light-dark(color-mix(in_oklab,var(--color-black)_10%,transparent),color-mix(in_oklab,var(--color-white)_10%,transparent))]',
        ],
        // Its centre sits on the face's edge at 45°, a corner's radius times 1 - 1/√2 in from each side, so it hugs a
        // circle and a square's rounded corner alike
        dot: [
            // Lifted, so in a group it stays over the next avatar
            'absolute z-1 size-(--avatar-dot) rounded-full shadow-[0_0_0_2px_var(--avatar-ring,var(--color-panel))]',
            'end-[calc(var(--avatar-radius)*0.2929-var(--avatar-dot)/2)] bottom-[calc(var(--avatar-radius)*0.2929-var(--avatar-dot)/2)]',
            'forced-colors:bg-[CanvasText]',
        ],
    },
    variants: {
        size: {
            '20': { base: '[--avatar-dot:6px] [--avatar-radius:var(--radius-sm)] [--avatar-size:1.25rem]', face: 'text-[length:0.625rem] leading-none' },
            '24': { base: '[--avatar-dot:8px] [--avatar-radius:var(--radius-md)] [--avatar-size:1.5rem]', face: 'text-[length:0.625rem] leading-none' },
            '32': { base: '[--avatar-dot:10px] [--avatar-radius:var(--radius-lg)] [--avatar-size:2rem]', face: 'text-label leading-none' },
            '48': { base: '[--avatar-dot:12px] [--avatar-radius:var(--radius-xl)] [--avatar-size:3rem]', face: 'text-[length:1.125rem] leading-none' },
            '64': { base: '[--avatar-dot:16px] [--avatar-radius:1rem] [--avatar-size:4rem]', face: 'text-[length:1.5rem] leading-none' },
        },
        shape: {
            circle: { base: '[--avatar-radius:calc(var(--avatar-size)/2)]' },
            square: '',
        },
        status: {
            online: { dot: 'bg-green-68' },
            away: { dot: 'bg-yellow-76' },
            busy: { dot: 'bg-red-67' },
        },
        // The tint is a pale step from the palette. In the light it fills the face under a dark shade of its own hue, and
        // in the dark the two swap, so the initials pass 4.5:1 in both. The count in a group is an opaque tint of what
        // it sits on instead, so it hides what it overlaps
        isCount: {
            false: '[--avatar-fill:light-dark(var(--tint),oklch(from_var(--tint)_0.4_calc(c*0.8)_h))] [--avatar-text:light-dark(oklch(from_var(--tint)_0.4_min(calc(c*1.5),0.16)_h),var(--tint))]',
            true: 'tabular-nums [--avatar-fill:color-mix(in_oklab,var(--bleed)_8%,var(--avatar-ring,var(--color-panel)))] [--avatar-text:var(--color-ink)]',
        },
        isLoaded: {
            true: { image: 'opacity-100' },
        },
        // A ring in the colour of what the group sits on parts each avatar from the one it overlaps
        isGrouped: {
            true: { face: 'shadow-[0_0_0_2px_var(--avatar-ring,var(--color-panel))]' },
        },
    },
    defaultVariants: {
        size: '32',
        shape: 'circle',
    },
});
// Soft, light steps from the palette, a few calm hues rather than the whole wheel
const tints = ['--color-olive-91', '--color-teal-88', '--color-sky-85', '--color-violet-82', '--color-orange-89', '--color-red-87', '--color-yellow-91'];
/** The tint a name always gets, the same on every visit, as a CSS variable from the palette */
export function avatarTint(name) {
    // FNV-1a, then mixed so the low bits the tint is picked by vary with every letter
    let hash = 0x811c9dc5;
    for (const character of name.trim().toLocaleLowerCase())
        hash = Math.imul(hash ^ character.codePointAt(0), 0x01000193);
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return `var(${tints[(hash >>> 0) % tints.length]})`;
}
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : undefined;
const graphemes = (word) => (segmenter ? Array.from(segmenter.segment(word), ({ segment }) => segment) : Array.from(word));
// A letter, a number or an emoji, so a word's opening bracket or quote is passed over
const initial = (word) => graphemes(word).find((grapheme) => /[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(grapheme));
// Scripts where one character is a name's syllable, so a second initial would read as a different name
const syllabic = /[\p{Script=Han}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}]/u;
/**
 * The initials for a name: the first letters of its first and last words, or one letter when there's one word, the
 * avatar is small, the name opens with an emoji, or it's written in Chinese, Japanese or Korean
 */
export function initials(name, { max = 2 } = {}) {
    const words = name.trim().split(/\s+/u).filter((word) => initial(word));
    const first = words.length ? initial(words[0]) : undefined;
    if (!first)
        return '';
    const last = words.length > 1 ? initial(words.at(-1)) : undefined;
    if (max === 1 || !last || /\p{Extended_Pictographic}/u.test(first) || syllabic.test(first) || /\p{Extended_Pictographic}/u.test(last))
        return first.toLocaleUpperCase();
    return (first + last).toLocaleUpperCase();
}
const statusLabels = { online: 'online', away: 'away', busy: 'busy' };
const GroupContext = createContext(null);
/** A person, as a round photo, or an organisation or project, as a square one, with their initials on a tint until the photo loads or if there isn’t one */
export function Avatar({ name, src, size, shape, status, statusLabel, className, style, ...props }) {
    const group = useContext(GroupContext);
    const [loaded, setLoaded] = useState();
    const [failed, setFailed] = useState();
    const resolvedSize = size ?? group?.size ?? 32;
    const styles = avatar({ size: `${resolvedSize}`, shape: shape ?? group?.shape, status, isLoaded: src != null && loaded === src, isGrouped: group != null, isCount: false });
    const label = status ? `${name}, ${statusLabel ?? statusLabels[status]}` : name;
    return (_jsxs("span", { role: "img", "aria-label": label, ...props, className: styles.base({ className }), style: { '--tint': avatarTint(name), ...style }, children: [_jsxs("span", { className: styles.face(), children: [_jsx("span", { "aria-hidden": "true", children: initials(name, { max: resolvedSize === 20 ? 1 : 2 }) }), src && failed !== src && (_jsx("img", { src: src, alt: "", 
                        // A cached image can finish before React listens for load
                        ref: (image) => {
                            if (image?.complete && image.naturalWidth > 0)
                                setLoaded(src);
                        }, onLoad: () => setLoaded(src), onError: () => setFailed(src), className: styles.image() }, src))] }), status && _jsx("span", { className: styles.dot() })] }));
}
// Each overlaps the one before by a sixth of its size, which keeps both initials clear of the next one's ring.
// The size is read from each avatar itself
export const avatarGroup = tv({ base: 'inline-flex items-center align-top *:not-first:-ms-[calc(var(--avatar-size)/6)]' });
const listFormat = new Intl.ListFormat('en-GB', { type: 'conjunction' });
/**
 * Avatars overlapping in a row, each parted from the next by a ring in the colour of what it sits on: set
 * --avatar-ring to that colour off the panel. It's named for screen readers by the people in it, as in “Sam Smith,
 * Alex Lee and 3 others”, or by an aria-label
 */
export function AvatarGroup({ children, max, size = 32, shape = 'circle', className, ...props }) {
    const avatars = Children.toArray(children).filter(isValidElement);
    // The count takes the last place, so a max of 4 shows 3 people and +2, rather than 4 and +1
    const shown = max != null && avatars.length > max ? avatars.slice(0, Math.max(max - 1, 1)) : avatars;
    const hidden = avatars.length - shown.length;
    const names = shown.map((child) => child.props.name).filter((name) => Boolean(name));
    const others = `${hidden} ${hidden === 1 ? 'other' : 'others'}`;
    const label = listFormat.format(hidden ? [...names, others] : names);
    const styles = avatar({ size: `${size}`, shape, isGrouped: true, isCount: true });
    return (_jsx(GroupContext.Provider, { value: { size, shape }, children: _jsxs("div", { role: "group", "aria-label": label, ...props, className: avatarGroup({ className }), children: [shown, hidden > 0 && (_jsx("span", { role: "img", "aria-label": others, className: styles.base(), children: _jsxs("span", { "aria-hidden": "true", className: styles.face(), children: ["+", hidden] }) }))] }) }));
}
