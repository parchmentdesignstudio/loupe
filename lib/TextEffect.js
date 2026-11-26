import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from 'react';
import { tv } from './tv.js';
// The ray: a band of light that splits into colours as it crosses text, as light through a prism, wiping what the text
// said for what it says now. Where its light is, the text blurs, more towards its middle, which three blurred copies
// of the text carry, each shown in a band around the ray. The text's own colour stays on either side of it, as the
// text's fill is clear rather than its colour, so currentColor in the gradient is still the text's
// In pixels a millisecond, so it crosses at the same pace whatever the text's length
const PACE = 0.35;
// Half the ray's width, its slant, and how far the blur trails behind it
const RAY = 40;
const SLANT = (105 * Math.PI) / 180;
const TRAIL = 56;
// The pause before it crosses again, when it loops
const REST = 400;
// The colours, written out so each token's read can be found
const light = [
    'linear-gradient(105deg, currentColor calc(var(--ray) - 40px)',
    'var(--text-effect-ray-1,var(--color-ray-1)) calc(var(--ray) - 24px)',
    'var(--text-effect-ray-2,var(--color-ray-2)) calc(var(--ray) - 10px)',
    'var(--text-effect-ray-3,var(--color-ray-3)) calc(var(--ray) + 6px)',
    'var(--text-effect-ray-4,var(--color-ray-4)) calc(var(--ray) + 18px)',
    'var(--text-effect-ray-5,var(--color-ray-5)) calc(var(--ray) + 28px)',
    'currentColor calc(var(--ray) + 40px))',
].join(', ');
const painted = { backgroundImage: light, backgroundClip: 'text', WebkitTextFillColor: 'transparent' };
// What's new shows behind the ray, what it replaces ahead of it, and the sharp text fades out around the ray, where the
// blurred copies take over. Each copy is padded 8px for its blur, so its ray is 8px further in
const mask = (image) => ({ maskImage: image, WebkitMaskImage: image });
const masks = {
    now: mask('linear-gradient(90deg, #000 calc(var(--ray-x) - 8px), transparent calc(var(--ray-x) + 2px))'),
    old: mask('linear-gradient(90deg, transparent calc(var(--ray-x) - 8px), #000 calc(var(--ray-x) + 2px))'),
    sharp: mask('linear-gradient(90deg, #000 calc(var(--ray-x) - 56px), transparent calc(var(--ray-x) - 40px), transparent calc(var(--ray-x) + 14px), #000 calc(var(--ray-x) + 20px))'),
};
const blurs = [
    { blur: '0.5px', ...mask('linear-gradient(90deg, transparent calc(var(--blur-x) - 56px), #000 calc(var(--blur-x) - 40px), transparent calc(var(--blur-x) - 24px), transparent calc(var(--blur-x) + 8px), #000 calc(var(--blur-x) + 14px), transparent calc(var(--blur-x) + 20px))') },
    { blur: '1px', ...mask('linear-gradient(90deg, transparent calc(var(--blur-x) - 40px), #000 calc(var(--blur-x) - 24px), transparent calc(var(--blur-x) - 8px), transparent calc(var(--blur-x) + 2px), #000 calc(var(--blur-x) + 8px), transparent calc(var(--blur-x) + 14px))') },
    { blur: '2px', ...mask('linear-gradient(90deg, transparent calc(var(--blur-x) - 24px), #000 calc(var(--blur-x) - 8px), #000 calc(var(--blur-x) + 2px), transparent calc(var(--blur-x) + 8px))') },
];
const textEffect = tv({
    slots: {
        root: 'relative inline-grid max-w-full min-w-0 align-bottom',
        line: 'grid min-w-0 [grid-area:1/1]',
        // As wide as its text, to measure, and on one line, cut short where there isn't room
        layer: 'max-w-full justify-self-start truncate [grid-area:1/1]',
        copies: 'pointer-events-none absolute -inset-2 grid [--blur-x:calc(var(--ray-x)_+_8px)]',
        copy: 'grid p-2 [grid-area:1/1]',
    },
});
const slots = textEffect();
const reducesMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/**
 * Text that changes with an effect, such as a ray of light that crosses it. With reduced motion, the text just changes
 */
export function TextEffect({ children, loop = false, pace = PACE, className }) {
    const root = useRef(null);
    // What the text said, while the ray wipes it away, or null between crossings
    const [old, setOld] = useState(null);
    const [shown, setShown] = useState(children);
    if (children !== shown) {
        setShown(children);
        if (!reducesMotion())
            setOld(old ?? shown);
    }
    // Looping, it crosses the text it already shows
    const [rest, setRest] = useState(0);
    if (loop && old === null && rest === 0 && !reducesMotion()) {
        setRest(1);
        setOld(children);
    }
    else if (!loop && old === null && rest !== 0)
        setRest(0);
    useLayoutEffect(() => {
        const element = root.current;
        if (old === null || !element)
            return;
        const line = element.firstElementChild;
        const width = Math.max(0, ...[...line.children].map((layer) => layer.offsetWidth));
        const height = line.offsetHeight;
        const from = -RAY;
        const to = width + TRAIL;
        const duration = (to - from) / pace;
        // The gradient runs at a slant, so the ray's middle along it is further than along the text
        const aim = (x) => {
            element.style.setProperty('--ray', `${(x * Math.sin(SLANT) + (height / 2) * Math.abs(Math.cos(SLANT))).toFixed(1)}px`);
            element.style.setProperty('--ray-x', `${x.toFixed(1)}px`);
        };
        aim(from);
        // Timed from its first frame, so in a hidden tab it waits to be seen
        let start = -1;
        let frame = requestAnimationFrame(function step(now) {
            if (start < 0)
                start = now;
            const progress = (now - start) / duration;
            if (progress >= 1) {
                setOld(null);
                return;
            }
            aim(from + (to - from) * progress);
            frame = requestAnimationFrame(step);
        });
        return () => cancelAnimationFrame(frame);
    }, [old, pace]);
    // Between loops it rests off the end of the text
    useLayoutEffect(() => {
        if (old !== null || rest === 0 || !loop)
            return;
        const timer = setTimeout(() => setRest(0), REST);
        return () => clearTimeout(timer);
    }, [old, rest, loop]);
    const isCrossing = old !== null;
    return (_jsxs("span", { ref: root, className: slots.root({ className }), children: [_jsxs("span", { className: slots.line(), style: isCrossing ? masks.sharp : undefined, children: [_jsx("span", { className: slots.layer(), style: isCrossing ? { ...painted, ...masks.now } : undefined, children: children }), isCrossing && (_jsx("span", { "aria-hidden": true, className: slots.layer(), style: { ...painted, ...masks.old }, children: old }))] }), isCrossing && (_jsx("span", { "aria-hidden": true, className: slots.copies(), children: blurs.map(({ blur, ...image }) => (_jsxs("span", { className: slots.copy(), style: { ...image, filter: `blur(${blur})` }, children: [_jsx("span", { className: slots.layer(), style: { ...painted, ...masks.now }, children: children }), _jsx("span", { className: slots.layer(), style: { ...painted, ...masks.old }, children: old })] }, blur))) }))] }));
}
