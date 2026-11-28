// Shape helpers for 16px icons. Needs `npm i paper paperjs-offset` beside it.

const paper = require("paper/dist/paper-core.js")
const Module = require("module")
const orig = Module._load
Module._load = function (req, ...a) { return req === "paper" ? paper : orig.call(this, req, ...a) }
const { PaperOffset } = require("paperjs-offset")
paper.setup(new paper.Size(16, 16))
const { Path, Point, Size, Rectangle } = paper
const ni = { insert: false }
const rr = (x, y, w, h, r = 0.5) => new Path.Rectangle({ rectangle: new Rectangle(x, y, w, h), radius: r, insert: false })
const disc = (cx, cy, r) => new Path.Circle({ center: [cx, cy], radius: r, insert: false })
const U = (...ps) => ps.reduce((a, b) => a.unite(b, ni))
const S = (a, ...bs) => bs.reduce((x, b) => x.subtract(b, ni), a)
// A polygon whose corners each take their own radius
const rpoly = (pts, ks) => {
	const p = new Path({ insert: false, closed: true })
	pts.forEach((V, i) => {
		const k = ks[i] || 0, A = pts[(i + pts.length - 1) % pts.length], B = pts[(i + 1) % pts.length]
		const v = new Point(V), a = new Point(A).subtract(v).normalize(), b = new Point(B).subtract(v).normalize()
		if (!k) { p.add(v); return }
		const th = Math.acos(a.dot(b)), t = k / Math.tan(th / 2)
		const p0 = v.add(a.multiply(t)), p1 = v.add(b.multiply(t)), bis = a.add(b).normalize(), c = v.add(bis.multiply(k / Math.sin(th / 2)))
		p.add(p0)
		p.arcTo(c.add(bis.multiply(-k)), p1)
	})
	return p
}
// A bar between two points, 1.5 wide with 0.5 ends, as in the building blocks
const bar = (x1, y1, x2, y2, w = 1.5, k = 0.5) => {
	const a = new Point(x1, y1), b = new Point(x2, y2), n = b.subtract(a).normalize(w / 2).rotate(90)
	return rpoly([a.add(n), b.add(n), b.subtract(n), a.subtract(n)], [k, k, k, k])
}
const tr = (p, f) => { (p.children || [p]).flatMap((c) => c.segments).forEach((s) => { const P = s.point, hi = s.point.add(s.handleIn), ho = s.point.add(s.handleOut); const [x, y] = f(P.x, P.y), [xi, yi] = f(hi.x, hi.y), [xo, yo] = f(ho.x, ho.y); s.point = new Point(x, y); s.handleIn = new Point(xi - x, yi - y); s.handleOut = new Point(xo - x, yo - y) }); return p }
const svgP = (d) => new paper.CompoundPath({ pathData: d, insert: false })

const tint = (p) => { p.tint = true; return p }
const mirrorX = (p) => tr(p.clone(ni), (x, y) => [16 - x, y])
const mirrorY = (p) => tr(p.clone(ni), (x, y) => [x, 16 - y])
const arc = (cx, cy, r, w, a0, a1) => {
	const P = (d, rr) => [cx + rr * Math.cos(d * Math.PI / 180), cy + rr * Math.sin(d * Math.PI / 180)]
	const pts = []
	for (let d = a0; d <= a1 + 1e-9; d += (a1 - a0) / 24) pts.push(P(d, 30))
	const wedge = new Path({ segments: [[cx, cy], ...pts], closed: true, insert: false })
	const band = S(disc(cx, cy, r + w / 2), disc(cx, cy, r - w / 2)).intersect(wedge, ni)
	return U(band, disc(...P(a0, r), w / 2), disc(...P(a1, r), w / 2))
}
const offset = (p, d) => PaperOffset.offset(p, d, { join: 'round', insert: false })
const pathData = (p) => p.pathData.replace(/(\d\.\d{3})\d+/g, '$1')

module.exports = { paper, Path, Point, rr, disc, U, S, rpoly, bar, tr, svgP, tint, mirrorX, mirrorY, arc, offset, pathData }
