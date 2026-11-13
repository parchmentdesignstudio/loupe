import { useSyncExternalStore } from 'react';
const key = 'on-off-labels';
const listeners = new Set();
// Kept between visits where the browser lets it, and forgotten quietly where it doesn't
let current = (() => {
    try {
        return localStorage.getItem(key) === 'on';
    }
    catch {
        return false;
    }
})();
// The on-off-labels variant reads the attribute on the root, and turns on by itself where the system asks for more contrast
const apply = () => {
    document.documentElement.toggleAttribute('data-on-off-labels', current);
};
if (typeof document !== 'undefined')
    apply();
export function setOnOffLabels(isOn) {
    current = isOn;
    apply();
    try {
        localStorage.setItem(key, isOn ? 'on' : 'off');
    }
    catch { }
    for (const listener of listeners)
        listener();
}
/** A | in a switch that's on and an O in one that's off, so its state doesn't rest on colour, as iOS's On/Off Labels.
 * For the whole page, kept between visits. They show anyway where the system asks for more contrast */
export function useOnOffLabels() {
    const isOn = useSyncExternalStore((listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, () => current, () => false);
    return [isOn, setOnOffLabels];
}
