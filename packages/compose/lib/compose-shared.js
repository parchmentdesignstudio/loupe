// src/shared.js
var e = /Mac|iPhone|iPad/.test(navigator.platform);
function t(t) {
	let n = t ? t.toLowerCase().split("+") : [], r = n.pop();
	if (!r) return null;
	let i = (...e) => e.some((e) => n.includes(e)), a = {
		alt: i("alt", "option"),
		command: i("cmd", "command", "meta", "ctrl"),
		shift: i("shift"),
		code: /^[a-z]$/.test(r) ? `Key${r.toUpperCase()}` : /^\d$/.test(r) ? `Digit${r}` : r
	};
	return a.shown = `${a.alt ? "⌥" : ""}${a.shift ? "⇧" : ""}${a.command ? e ? "⌘" : "Ctrl " : ""}${r.toUpperCase()}`, a.matches = (e) => e.altKey === a.alt && (e.metaKey || e.ctrlKey) === a.command && e.shiftKey === a.shift && (e.code === a.code || e.key.toLowerCase() === r), a;
}
var n = () => location.pathname + (location.hash.startsWith("#/") ? location.hash : ""), r = () => `compose:${n()}`, i = "compose:on";
export { r as a, t as i, e as n, n as r, i as t };
