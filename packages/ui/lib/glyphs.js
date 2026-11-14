import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// The small marks inside controls, drawn here so the package needs nothing else. Each is
// hidden from screen readers, as the control around it carries the meaning
const glyph = 'size-4 shrink-0 fill-none stroke-current stroke-[1.5]';
export const Check = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m3.5 8.5 3 3 6-7", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const Dash = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "M4 8h8", strokeLinecap: "round" }) }));
export const Plus = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "M8 4v8M4 8h8", strokeLinecap: "round" }) }));
export const ChevronDown = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m4 6 4 4 4-4", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const ChevronRight = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m6 4 4 4-4 4", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const Cross = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m4.5 4.5 7 7m0-7-7 7", strokeLinecap: "round" }) }));
// Filled dots rather than strokes, so they read at 16px
export const Ellipsis = ({ className = 'size-4 shrink-0 fill-current' }) => (_jsxs("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: [_jsx("circle", { cx: "3.5", cy: "8", r: "1.25" }), _jsx("circle", { cx: "8", cy: "8", r: "1.25" }), _jsx("circle", { cx: "12.5", cy: "8", r: "1.25" })] }));
export const MagnifyingGlass = ({ className = glyph }) => (_jsxs("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: [_jsx("circle", { cx: "7", cy: "7", r: "4.25" }), _jsx("path", { d: "m10 10 3 3", strokeLinecap: "round" })] }));
export const ChevronLeft = ({ className = glyph }) => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: _jsx("path", { d: "m10 4-4 4 4 4", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const CalendarGlyph = ({ className = glyph }) => (_jsxs("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: className, children: [_jsx("rect", { x: "2.75", y: "3.75", width: "10.5", height: "9.5", rx: "2" }), _jsx("path", { d: "M2.75 7h10.5M5.5 2.25v2.5m5-2.5v2.5", strokeLinecap: "round" })] }));
