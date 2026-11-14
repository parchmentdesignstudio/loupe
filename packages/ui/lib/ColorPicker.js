import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { Button, ColorPicker as AriaColorPicker, DialogTrigger } from 'react-aria-components';
import { ColorArea } from './ColorArea.js';
import { ColorField } from './ColorField.js';
import { ColorSlider } from './ColorSlider.js';
import { ColorSwatch } from './ColorSwatch.js';
import { Dialog } from './Dialog.js';
import { field } from './Field.js';
import { Popover } from './Popover.js';
import { trigger } from './Select.js';
import { tv } from './tv.js';
const colorPicker = tv({ base: 'flex flex-col gap-1.5' });
/** A colour, shown as a swatch and its hex in a field-like button that opens a colour area, a hue slider and a hex field */
export function ColorPicker({ label, 'aria-label': ariaLabel = 'Colour', children, className, ...props }) {
    const labelId = useId();
    const valueId = useId();
    return (_jsx(AriaColorPicker, { ...props, children: ({ color }) => (_jsxs("div", { className: colorPicker({ className }), children: [label && (_jsx("span", { id: labelId, className: field().label(), children: label })), _jsxs(DialogTrigger, { children: [_jsxs(Button, { "aria-labelledby": label ? `${labelId} ${valueId}` : undefined, "aria-label": label ? undefined : ariaLabel, "aria-describedby": label ? undefined : valueId, 
                            // The swatch sits as far in from the edge as from the top, so it reads as part of the field
                            className: (state) => trigger({ ...state, className: 'pl-2' }), children: [_jsx(ColorSwatch, { className: "size-4 rounded-sm" }), _jsx("span", { id: valueId, className: "min-w-0 flex-1 truncate tabular-nums", children: color.toString('hex') })] }), _jsx(Popover, { placement: "bottom start", className: "w-64", children: _jsx(Dialog, { "aria-labelledby": label ? labelId : undefined, "aria-label": label ? undefined : ariaLabel, className: "flex flex-col gap-3", children: children ?? (_jsxs(_Fragment, { children: [_jsx(ColorArea, { colorSpace: "hsb", xChannel: "saturation", yChannel: "brightness" }), _jsx(ColorSlider, { colorSpace: "hsb", channel: "hue" }), _jsx(ColorField, { label: "Hex" })] })) }) })] })] })) }));
}
