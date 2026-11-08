import { jsx as _jsx } from "react/jsx-runtime";
// The small marks inside controls, drawn here so the package needs nothing else. Each is
// hidden from screen readers, as the control around it carries the meaning
const glyph = 'size-4 shrink-0 fill-none stroke-current stroke-[1.5]';
export const Check = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m3.5 8.5 3 3 6-7", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const Dash = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "M4 8h8", strokeLinecap: "round" }) }));
export const ChevronDown = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m4 6 4 4 4-4", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const ChevronRight = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m6 4 4 4-4 4", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const Cross = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m4.5 4.5 7 7m0-7-7 7", strokeLinecap: "round" }) }));
