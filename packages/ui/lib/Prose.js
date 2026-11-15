import { jsx as _jsx } from "react/jsx-runtime";
import { tv } from './tv.js';
// The prose class is in tokens.css, so a site without React, such as one writing in Astro, sets it itself
const prose = tv({ base: 'prose' });
/** Writing at length as plain HTML, such as a post from Markdown or a CMS, set in Loupe's type with no classes inside */
export function Prose(props) {
    return _jsx("div", { ...props, className: prose({ className: props.className }) });
}
