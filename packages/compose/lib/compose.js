import { a as e, i as t } from "./compose-shared.js";
// src/loader.js
var n = () => {
	try {
		return !!(sessionStorage.getItem("compose:on") || sessionStorage.getItem(e()));
	} catch {
		return !1;
	}
};
function r(e) {
	let t = () => "requestIdleCallback" in window ? requestIdleCallback(e, { timeout: 2e3 }) : setTimeout(e, 200);
	document.readyState === "complete" ? t() : addEventListener("load", t, { once: !0 });
}
function i({ launcher: e = !0, shortcut: i = "alt+g", onToggle: a } = {}) {
	if (window.parchmentCompose) return window.parchmentCompose;
	let o = t(i), s = null, c = null, l = () => c ??= import("./compose-client.js").then(({ start: t }) => (removeEventListener("keydown", u, !0), s = t({
		launcher: e,
		shortcut: i,
		onToggle: a
	}), s));
	function u(e) {
		o?.matches(e) && (e.preventDefault(), l().then(() => s.toggle(!0)));
	}
	addEventListener("keydown", u, !0);
	let d = {
		toggle(e) {
			s ? s.toggle(e) : e !== !1 && l().then(() => s.toggle(!0));
		},
		get active() {
			return s?.active ?? !1;
		},
		changes: () => s?.changes() ?? {
			count: 0,
			text: ""
		},
		commands: () => s?.commands() ?? [{
			id: "compose",
			name: "Compose this page",
			keys: o?.shown,
			run: () => d.toggle(!0)
		}]
	};
	return window.parchmentCompose = d, dispatchEvent(new CustomEvent("compose:change")), (e || n()) && r(l), d;
}
export { i as mount };
