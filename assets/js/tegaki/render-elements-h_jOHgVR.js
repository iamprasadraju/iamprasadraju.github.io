import { a as scriptsDiffer, c as resolvedDirections, i as resolvedScripts, o as trailingScript, r as toCssFeatureSettings, s as paragraphDirection } from "./features-EsyCjxeo.js";
//#region src/lib/paintStroke.ts
/**
* Paint a stroke's ink as far as the pen has drawn it: `stroke.path` up to
* `stroke.progress`, each stretch as wide as the path is there, then the nib
* stamps the pen has reached. A path of one point is a dot. A path of one
* width in one flat paint is a single canvas stroke; otherwise each segment
* is stroked on its own so its width and color can change.
*/
function paintStroke({ ctx, stroke, style, lineCap }) {
	if (stroke.state === "pending") return;
	const { path, progress } = stroke;
	const pts = path.points;
	const n = pts.length;
	if (n === 0 || progress <= 0) return;
	const colorAt = typeof style === "function" ? style : null;
	const paintAt = (t) => colorAt ? colorAt(t) : style;
	if (n === 1) {
		const dot = pts[0];
		ctx.fillStyle = paintAt(0);
		ctx.beginPath();
		if (lineCap === "round") {
			ctx.arc(dot.x, dot.y, dot.width / 2, 0, Math.PI * 2);
			ctx.fill();
		} else ctx.fillRect(dot.x - dot.width / 2, dot.y - dot.width / 2, dot.width, dot.width);
		paintNibs(ctx, stroke, paintAt);
		return;
	}
	const lastIdx = path.lastIndexAt(progress);
	const tail = lastIdx + 1 < n && progress > pts[lastIdx].t ? path.pointAt(progress) : null;
	const count = lastIdx + 1 + (tail ? 1 : 0);
	const xs = new Array(count);
	const ys = new Array(count);
	for (let i = 0; i <= lastIdx; i++) {
		xs[i] = pts[i].x;
		ys[i] = pts[i].y;
	}
	if (tail) {
		xs[count - 1] = tail.x;
		ys[count - 1] = tail.y;
	}
	const widthOf = (i) => i <= lastIdx ? pts[i].width : tail.width;
	const tOf = (i) => i <= lastIdx ? pts[i].t : progress;
	ctx.lineCap = lineCap;
	ctx.lineJoin = "round";
	if (!colorAt && path.uniformWidth) {
		ctx.strokeStyle = style;
		ctx.lineWidth = pts[0].width;
		ctx.beginPath();
		ctx.moveTo(xs[0], ys[0]);
		for (let i = 1; i < count; i++) ctx.lineTo(xs[i], ys[i]);
		ctx.stroke();
	} else {
		const joinDisc = (x, y, lw) => {
			ctx.fillStyle = ctx.strokeStyle;
			ctx.beginPath();
			ctx.arc(x, y, lw / 2, 0, Math.PI * 2);
			ctx.fill();
		};
		for (let i = 1; i < count; i++) {
			const lw = (widthOf(i - 1) + widthOf(i)) / 2;
			ctx.lineWidth = lw;
			ctx.strokeStyle = paintAt((tOf(i - 1) + tOf(i)) / 2);
			const first = i === 1;
			const last = i === count - 1;
			ctx.lineCap = lineCap === "round" || !(first || last) ? "round" : lineCap;
			ctx.beginPath();
			ctx.moveTo(xs[i - 1], ys[i - 1]);
			ctx.lineTo(xs[i], ys[i]);
			ctx.stroke();
			if (lineCap !== "round" && first !== last) {
				if (first) joinDisc(xs[i], ys[i], lw);
				else joinDisc(xs[i - 1], ys[i - 1], lw);
			}
		}
	}
	paintNibs(ctx, stroke, paintAt);
}
/** Fill the nib stamps the pen has reached, over the stroke they belong to. */
function paintNibs(ctx, stroke, paintAt) {
	for (const nib of stroke.nibs) {
		if (nib.t > stroke.progress) continue;
		const at = stroke.path.pointAt(nib.t);
		const rx = nib.rx * at.width;
		const ry = nib.ry * at.width;
		if (rx <= 0 || ry <= 0) continue;
		ctx.fillStyle = paintAt(nib.t);
		ctx.beginPath();
		ctx.ellipse(at.x + nib.dx, at.y + nib.dy, rx, ry, nib.angle, 0, Math.PI * 2);
		ctx.fill();
	}
}
//#endregion
//#region src/lib/random.ts
/**
* A random number generator (0–1) that yields the same sequence for the same
* `seed` and `key` — so something painted every frame with it (bristles,
* speckles) stays put instead of flickering. mulberry32 over an FNV-1a hash.
*/
function seededRandom(seed, key) {
	let h = 2166136261 ^ Math.floor(seed * 1e3);
	const s = String(key);
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	let a = h >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
//#endregion
//#region src/lib/strokePath.ts
/** A polyline with per-point width and draw progress. */
var StrokePath = class StrokePath {
	points;
	/** Arc length in px. */
	length;
	_exact;
	_bounds;
	_uniform;
	constructor(points, exact) {
		this.points = points;
		this._exact = exact;
		let len = 0;
		for (let i = 1; i < points.length; i++) len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
		this.length = len;
	}
	/** Index of the last point the pen has reached at draw progress `t` (0 before the first). */
	lastIndexAt(t) {
		return lastAtOrBefore(this.points, t);
	}
	/** Whether every point is as wide as the first: the ink can be drawn in one stroke. */
	get uniformWidth() {
		if (this._uniform === void 0) {
			const w = this.points[0]?.width;
			this._uniform = this.points.every((p) => p.width === w);
		}
		return this._uniform;
	}
	/**
	* Every point passed through `fn` — to move points or change their width,
	* as a `geometry` plugin does. `fn` also places the points {@link pointAt}
	* samples between two points, so where the pen is stays exact: a wobble of
	* the point between two points, not a line between two wobbled points.
	*/
	map(fn) {
		const exact = (t) => {
			const s = this.pointAt(t);
			return fn(withData({
				x: s.x,
				y: s.y,
				width: s.width,
				t
			}, s.data));
		};
		return new StrokePath(this.points.map(fn), exact);
	}
	/** The point the pen reaches at draw progress `t` (clamped to the path). */
	pointAt(t) {
		const pts = this.points;
		if (pts.length === 0) return {
			x: 0,
			y: 0,
			angle: 0,
			width: 0
		};
		if (pts.length === 1) return withData({
			x: pts[0].x,
			y: pts[0].y,
			angle: 0,
			width: pts[0].width
		}, pts[0].data);
		const k = lastAtOrBefore(pts, t);
		const a = pts[k];
		const b = pts[k + 1];
		const inside = b !== void 0 && t > a.t && b.t > a.t;
		const s0 = inside ? k : Math.max(0, k - 1);
		const angle = Math.atan2(pts[s0 + 1].y - pts[s0].y, pts[s0 + 1].x - pts[s0].x);
		if (this._exact) {
			const e = this._exact(Math.max(pts[0].t, Math.min(t, pts[pts.length - 1].t)));
			return withData({
				x: e.x,
				y: e.y,
				angle,
				width: e.width
			}, e.data);
		}
		if (!inside) return withData({
			x: a.x,
			y: a.y,
			angle,
			width: a.width
		}, a.data);
		const f = (t - a.t) / (b.t - a.t);
		return withData({
			x: a.x + (b.x - a.x) * f,
			y: a.y + (b.y - a.y) * f,
			angle,
			width: a.width + (b.width - a.width) * f
		}, mixData(a.data, b.data, f));
	}
	/** The part between draw progress `from` and `to`, re-timed to its own 0–1. */
	slice(from, to) {
		const pts = this.points;
		if (pts.length < 2) return this;
		const t0 = pts[0].t;
		const t1 = pts[pts.length - 1].t;
		const lo = Math.max(t0, Math.min(Math.min(from, to), t1));
		const hi = Math.max(t0, Math.min(Math.max(from, to), t1));
		const span = hi - lo;
		const retime = (t) => span > 0 ? (t - lo) / span : 0;
		const at = (t) => {
			const p = this.pointAt(t);
			return withData({
				x: p.x,
				y: p.y,
				width: p.width,
				t: retime(t)
			}, p.data);
		};
		const out = [at(lo)];
		for (const p of pts) if (p.t > lo && p.t < hi) out.push({
			...p,
			t: retime(p.t)
		});
		out.push(at(hi));
		const exact = this._exact;
		return new StrokePath(out, exact ? (t) => exact(lo + t * span) : void 0);
	}
	/** The box the ink covers: every point, padded by half its width. `null` for an empty path. */
	bounds() {
		if (this._bounds !== void 0) return this._bounds;
		let box = null;
		for (const p of this.points) {
			const r = p.width / 2;
			if (!box) box = {
				minX: p.x - r,
				minY: p.y - r,
				maxX: p.x + r,
				maxY: p.y + r
			};
			else {
				box.minX = Math.min(box.minX, p.x - r);
				box.minY = Math.min(box.minY, p.y - r);
				box.maxX = Math.max(box.maxX, p.x + r);
				box.maxY = Math.max(box.maxY, p.y + r);
			}
		}
		this._bounds = box;
		return box;
	}
};
/** `point` with `data`, when there is any (a point without data has no `data` key). */
function withData(point, data) {
	return data ? {
		...point,
		data
	} : point;
}
/** The data a fraction `f` of the way from `a`'s to `b`'s: each key both have interpolated, a key only one has held. */
function mixData(a, b, f) {
	if (!a || !b || a === b) return a ?? b;
	const out = {
		...b,
		...a
	};
	for (const key in b) {
		const from = a[key];
		if (from !== void 0) out[key] = from + (b[key] - from) * f;
	}
	return out;
}
/** Index of the last point with `t` at or before `t` (0 when `t` precedes them all). */
function lastAtOrBefore(pts, t) {
	let lo = 0;
	let hi = pts.length - 1;
	while (lo < hi) {
		const mid = lo + hi + 1 >>> 1;
		if (pts[mid].t <= t) lo = mid;
		else hi = mid - 1;
	}
	return lo;
}
/** Past this, a corner's miter becomes a bevel (in multiples of the offset). */
const MITER_LIMIT = 2;
/**
* `path` moved sideways by `distance` px — positive to the pen's left (as it
* travels), negative to its right. A function gives each point its own
* distance: {@link inkEdge} keeps a constant gap from the edge of ink whose
* width varies. Points keep their source's `t`.
*
* Corners sharper than the offset can follow are beveled on the outside; on
* the inside, where the offset line would loop back over itself, the loop is
* cut out.
*/
function offsetPath(path, distance) {
	const d = typeof distance === "number" ? () => distance : distance;
	const src = [];
	for (const p of path.points) {
		const last = src[src.length - 1];
		if (!last || last.x !== p.x || last.y !== p.y) src.push(p);
	}
	if (src.length < 2) return new StrokePath(src.map((p) => ({ ...p })));
	const dirs = [];
	for (let i = 0; i + 1 < src.length; i++) {
		const dx = src[i + 1].x - src[i].x;
		const dy = src[i + 1].y - src[i].y;
		const len = Math.hypot(dx, dy);
		dirs.push([dx / len, dy / len]);
	}
	const left = ([dx, dy]) => [dy, -dx];
	const out = [];
	const travel = [];
	const push = (p, [nx, ny], dist, dir) => {
		if (out.length > 0) travel.push(dir);
		out.push(withData({
			x: p.x + nx * dist,
			y: p.y + ny * dist,
			width: p.width,
			t: p.t
		}, p.data));
	};
	for (let i = 0; i < src.length; i++) {
		const p = src[i];
		const dist = d(p);
		const din = dirs[i - 1];
		const dout = dirs[i];
		if (!din || !dout) {
			const dir = din ?? dout;
			push(p, left(dir), dist, dir);
			continue;
		}
		const n0 = left(din);
		const n1 = left(dout);
		const mx = n0[0] + n1[0];
		const my = n0[1] + n1[1];
		const mLen = Math.hypot(mx, my);
		const cosHalf = mLen / 2;
		if (cosHalf > 1 / MITER_LIMIT) push(p, [mx / mLen / cosHalf, my / mLen / cosHalf], dist, din);
		else {
			const bisector = [din[0] + dout[0], din[1] + dout[1]];
			push(p, n0, dist, din);
			push(p, n1, dist, bisector);
		}
	}
	return new StrokePath(cutLoops(out, travel));
}
/**
* Cut the loops an inside offset makes at a turn tighter than the offset:
* where two segments cross and the stretch between them runs backwards
* against the source (a real crossing — a cursive loop — keeps running
* forwards and is kept). Nearest crossing first, so a small loop inside a
* real one goes alone.
*/
function cutLoops(pts, travel) {
	const backwards = (i) => {
		const dx = pts[i + 1].x - pts[i].x;
		const dy = pts[i + 1].y - pts[i].y;
		return dx * travel[i][0] + dy * travel[i][1] < 0;
	};
	for (let i = 0; i + 1 < pts.length; i++) for (let j = i + 2; j + 1 < pts.length; j++) {
		const hit = segmentIntersection(pts[i], pts[i + 1], pts[j], pts[j + 1]);
		if (!hit) continue;
		let reversed = false;
		for (let k = i; k <= j && !reversed; k++) reversed = backwards(k);
		if (!reversed) continue;
		const a = pts[i];
		const b = pts[i + 1];
		const cut = withData({
			x: a.x + (b.x - a.x) * hit,
			y: a.y + (b.y - a.y) * hit,
			width: a.width + (b.width - a.width) * hit,
			t: a.t + (b.t - a.t) * hit
		}, mixData(a.data, b.data, hit));
		pts.splice(i + 1, j - i, cut);
		travel.splice(i + 1, j - i, travel[j]);
		i--;
		break;
	}
	return pts;
}
/** Where segment ab crosses segment cd, as a fraction along ab; null if they don't. */
function segmentIntersection(a, b, c, d) {
	const rx = b.x - a.x;
	const ry = b.y - a.y;
	const sx = d.x - c.x;
	const sy = d.y - c.y;
	const den = rx * sy - ry * sx;
	if (den === 0) return null;
	const u = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den;
	const v = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
	return u > 0 && u < 1 && v > 0 && v < 1 ? u : null;
}
/**
* An {@link offsetPath} distance that keeps `gap` px clear of the ink's edge
* — half the ink's width, which pressure and taper vary, plus the gap — on
* the pen's left (`side = 1`) or right (`side = -1`).
*/
function inkEdge(gap, side = 1) {
	return (p) => side * (p.width / 2 + gap);
}
/**
* How far `point` is from the nearest ink of `paths`, in px: distance to the
* centreline less half the ink's width there. Negative inside the ink;
* `Infinity` with no paths.
*/
function clearance(point, paths) {
	let best = Infinity;
	for (const path of paths) {
		const pts = path.points;
		if (pts.length === 1) best = Math.min(best, Math.hypot(point.x - pts[0].x, point.y - pts[0].y) - pts[0].width / 2);
		for (let i = 0; i + 1 < pts.length; i++) {
			const a = pts[i];
			const b = pts[i + 1];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const len2 = dx * dx + dy * dy;
			const f = len2 > 0 ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2)) : 0;
			const dist = Math.hypot(point.x - (a.x + dx * f), point.y - (a.y + dy * f));
			best = Math.min(best, dist - (a.width + (b.width - a.width) * f) / 2);
		}
	}
	return best;
}
/** The box around every given box; `null` when there are none. */
function unionBoxes(boxes) {
	let out = null;
	for (const b of boxes) {
		if (!b) continue;
		if (!out) out = { ...b };
		else {
			out.minX = Math.min(out.minX, b.minX);
			out.minY = Math.min(out.minY, b.minY);
			out.maxX = Math.max(out.maxX, b.maxX);
			out.maxY = Math.max(out.maxY, b.maxY);
		}
	}
	return out;
}
function expandBox(box, by) {
	return box && {
		minX: box.minX - by,
		minY: box.minY - by,
		maxX: box.maxX + by,
		maxY: box.maxY + by
	};
}
//#endregion
//#region src/core/plugin-registry.ts
const factories = /* @__PURE__ */ new Map();
const listeners = /* @__PURE__ */ new Set();
/**
* Register plugin factories (made with `createPlugin`) so `plugins` can name
* them: `'glow'`, or `['glow', { radius: 0.15 }]` with options. A factory is
* registered under its `name`; registering another under the same name
* replaces it. Renderers already waiting on a name pick it up.
*/
function registerPlugin(...list) {
	const names = [];
	for (const factory of list) {
		if (typeof factory !== "function" || !factory.name) throw new Error("registerPlugin: expected a plugin factory made with createPlugin().");
		factories.set(factory.name, factory);
		names.push(factory.name);
	}
	for (const listener of listeners) listener(names);
}
/** The factory registered under `name`. */
function getPlugin(name) {
	return factories.get(name);
}
/** Be told the names of factories as they're registered. Returns the unsubscribe. */
function onPluginRegistered(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
/** A named entry of a plugin list, as its name and options. */
function namedSpec(spec) {
	if (typeof spec === "string") return {
		name: spec,
		options: void 0
	};
	if (Array.isArray(spec) && typeof spec[0] === "string") return {
		name: spec[0],
		options: spec[1]
	};
	return null;
}
/** Whether a plugin list names every plugin — nothing in it is an object, so it survives JSON (an Astro prop sent to the client). */
function isDeclarative(specs) {
	return specs.every((spec) => namedSpec(spec) !== null);
}
/**
* A plugin list written as text, as the `plugins` attribute of
* `<tegaki-renderer>` takes it: a JSON array (`'["taper", ["glow", {"radius": 0.15}]]'`),
* or names split by spaces or commas (`"taper glow"`). Empty or unset is
* `undefined`; invalid JSON is an empty list, with a warning.
*/
function parsePluginSpecs(value) {
	const text = value?.trim();
	if (!text) return void 0;
	if (text.startsWith("[")) {
		try {
			const parsed = JSON.parse(text);
			if (Array.isArray(parsed)) return parsed;
		} catch {}
		console.warn(`[tegaki] plugins: expected a JSON array or plugin names, got ${JSON.stringify(text)}.`);
		return [];
	}
	return text.split(/[\s,]+/).filter(Boolean);
}
const warnedMissing = /* @__PURE__ */ new Set();
/**
* Warn that `name` isn't registered — once the page has loaded, since the
* script registering it may run after the renderer (Astro orders its
* scripts as it likes), and only if it still isn't by then.
*/
function warnMissing(name) {
	if (warnedMissing.has(name)) return;
	const check = () => {
		if (factories.has(name) || warnedMissing.has(name)) return;
		warnedMissing.add(name);
		console.warn(`[tegaki] No plugin registered as "${name}". Register its factory before naming it: \`TegakiEngine.registerPlugin(${name}Plugin)\` (for a built-in plugin, import it from 'tegaki/core').`);
	};
	if (typeof document === "undefined" || typeof window === "undefined" || document.readyState === "complete") check();
	else window.addEventListener("load", check, { once: true });
}
/**
* Turns plugin lists into plugins, keeping the plugin made for a named
* entry as long as a later list names it with the same options — so a
* renderer given a new array of the same names every render keeps its
* plugins' caches and attachments. Plugin objects pass through as they are.
*/
var PluginResolver = class {
	made = /* @__PURE__ */ new Map();
	/** Which factory made each plugin, so a factory registered again under the same name makes new ones. */
	madeBy = /* @__PURE__ */ new WeakMap();
	resolve(specs, { warn = true } = {}) {
		const plugins = [];
		const missing = [];
		const made = /* @__PURE__ */ new Map();
		const seen = /* @__PURE__ */ new Map();
		for (const spec of specs ?? []) {
			const named = namedSpec(spec);
			if (!named) {
				if (spec && typeof spec === "object" && !Array.isArray(spec)) plugins.push(spec);
				else if (warn) console.warn("[tegaki] plugins: skipping an entry that is neither a plugin, a name nor [name, options]:", spec);
				continue;
			}
			const factory = factories.get(named.name);
			if (!factory) {
				missing.push(named.name);
				if (warn) warnMissing(named.name);
				continue;
			}
			const base = `${named.name}\u0000${JSON.stringify(factory.changed(named.options))}`;
			const n = seen.get(base) ?? 0;
			seen.set(base, n + 1);
			const key = `${base}\u0000${n}`;
			let plugin = this.made.get(key);
			if (!plugin || this.madeBy.get(plugin) !== factory) {
				plugin = factory(factory.resolve(named.options));
				this.madeBy.set(plugin, factory);
			}
			made.set(key, plugin);
			plugins.push(plugin);
		}
		this.made = made;
		return {
			plugins,
			missing
		};
	}
};
/** Names from `specs` that are among `names` — whether a registration concerns a list. */
function namesAny(specs, names) {
	return specs.some((spec) => {
		const named = namedSpec(spec);
		return named !== null && names.includes(named.name);
	});
}
//#endregion
//#region src/lib/easings.ts
/** Default stroke easing: ease-out quad. */
function defaultStrokeEasing(t) {
	return 1 - (1 - t) * (1 - t);
}
//#endregion
//#region src/lib/catmullRom.ts
/**
* Sample `count` points along a centripetal Catmull-Rom segment from `p1` to
* `p2`, with neighbor control points `p0` and `p3`. Samples are emitted at
* `u = k/count` for `k = 1..count`, so the last sample equals `p2`.
*
* Centripetal parameterization (α = 0.5) avoids the cusps and self-loops that
* uniform/chordal Catmull-Rom can produce on sharp corners — relevant for the
* baked RDP-simplified polylines the renderer consumes.
*
* For endpoint segments where a neighbor is missing, pass a phantom point
* built with {@link reflect}. Zero-length chords are clamped to a tiny epsilon
* so the knot parameterization stays non-degenerate.
*/
function sampleCatmullRom(p0, p1, p2, p3, count) {
	const d01 = Math.max(dist(p0, p1), 1e-6);
	const d12 = Math.max(dist(p1, p2), 1e-6);
	const d23 = Math.max(dist(p2, p3), 1e-6);
	const t0 = 0;
	const t1 = t0 + Math.sqrt(d01);
	const t2 = t1 + Math.sqrt(d12);
	const t3 = t2 + Math.sqrt(d23);
	const out = new Array(count);
	for (let k = 1; k <= count; k++) {
		const t = t1 + k / count * (t2 - t1);
		out[k - 1] = evalBarryGoldman(p0, p1, p2, p3, t0, t1, t2, t3, t);
	}
	return out;
}
/**
* Reflect `p` across `anchor` to produce a phantom neighbor for endpoint
* segments. The result lies on the extension of (p, anchor) past `anchor` at
* the same distance — equivalent to a zero-curvature extrapolation, which
* gives a natural straight start/end tangent.
*/
function reflect(anchor, p) {
	return [
		2 * anchor[0] - p[0],
		2 * anchor[1] - p[1],
		anchor[2]
	];
}
function dist(a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	return Math.sqrt(dx * dx + dy * dy);
}
function evalBarryGoldman(p0, p1, p2, p3, t0, t1, t2, t3, t) {
	const a1x = lerp(p0[0], p1[0], t0, t1, t);
	const a1y = lerp(p0[1], p1[1], t0, t1, t);
	const a1w = lerp(p0[2], p1[2], t0, t1, t);
	const a2x = lerp(p1[0], p2[0], t1, t2, t);
	const a2y = lerp(p1[1], p2[1], t1, t2, t);
	const a2w = lerp(p1[2], p2[2], t1, t2, t);
	const a3x = lerp(p2[0], p3[0], t2, t3, t);
	const a3y = lerp(p2[1], p3[1], t2, t3, t);
	const a3w = lerp(p2[2], p3[2], t2, t3, t);
	const b1x = lerp(a1x, a2x, t0, t2, t);
	const b1y = lerp(a1y, a2y, t0, t2, t);
	const b1w = lerp(a1w, a2w, t0, t2, t);
	const b2x = lerp(a2x, a3x, t1, t3, t);
	const b2y = lerp(a2y, a3y, t1, t3, t);
	const b2w = lerp(a2w, a3w, t1, t3, t);
	return {
		x: lerp(b1x, b2x, t1, t2, t),
		y: lerp(b1y, b2y, t1, t2, t),
		width: lerp(b1w, b2w, t1, t2, t)
	};
}
function lerp(a, b, ta, tb, t) {
	const span = tb - ta;
	if (span === 0) return a;
	return a + (b - a) * ((t - ta) / span);
}
//#endregion
//#region src/lib/strokeCache.ts
/**
* Subdivide a stroke so that no sub-segment exceeds `maxSegLen` font units.
* Pass `Infinity` (or any non-finite value) to skip subdivision and return
* the raw polyline.
*
* When `smoothing` is true, intermediate vertices are placed on a centripetal
* Catmull-Rom spline through the original points (see `catmullRom.ts`) —
* hiding the polyline facets that show up at large render sizes. The original
* points remain on the curve, so endpoints and `cumLen`/`idx` semantics are
* preserved. Has no effect when `maxSegLen` is non-finite (no subdivision).
*
* Output depends only on `(stroke.p, maxSegLen, smoothing)` — not on position,
* seed, progress, or effect config — so it can be cached and shared across
* every instance of the same glyph at the same font size.
*/
function subdivideStroke(stroke, maxSegLen, smoothing = false) {
	const pts = stroke.p;
	const n = pts.length;
	if (n === 0) return {
		vertices: [],
		totalLen: 0,
		avgWidth: 0,
		pointCumLen: []
	};
	const first = pts[0];
	const vertices = [{
		x: first[0],
		y: first[1],
		width: first[2],
		cumLen: 0,
		idx: 0
	}];
	let cumLen = 0;
	const pointCumLen = [0];
	for (let j = 1; j < n; j++) {
		const prev = pts[j - 1];
		const cur = pts[j];
		const dx = cur[0] - prev[0];
		const dy = cur[1] - prev[1];
		const chordLen = Math.sqrt(dx * dx + dy * dy);
		const count = chordLen > 0 && Number.isFinite(maxSegLen) && maxSegLen > 0 ? Math.max(1, Math.ceil(chordLen / maxSegLen)) : 1;
		if (smoothing && count > 1) {
			const samples = sampleCatmullRom(j >= 2 ? pts[j - 2] : reflect(prev, cur), prev, cur, j + 1 < n ? pts[j + 1] : reflect(cur, prev), count);
			let px = prev[0];
			let py = prev[1];
			let segAccum = 0;
			for (let k = 0; k < count; k++) {
				const s = samples[k];
				const ex = s.x - px;
				const ey = s.y - py;
				segAccum += Math.sqrt(ex * ex + ey * ey);
				vertices.push({
					x: s.x,
					y: s.y,
					width: s.width,
					cumLen: cumLen + segAccum,
					idx: j - 1 + (k + 1) / count
				});
				px = s.x;
				py = s.y;
			}
			cumLen += segAccum;
		} else {
			const dw = cur[2] - prev[2];
			for (let k = 1; k <= count; k++) {
				const t = k / count;
				vertices.push({
					x: prev[0] + dx * t,
					y: prev[1] + dy * t,
					width: prev[2] + dw * t,
					cumLen: cumLen + chordLen * t,
					idx: j - 1 + t
				});
			}
			cumLen += chordLen;
		}
		pointCumLen.push(cumLen);
	}
	let widthSum = 0;
	for (const p of pts) widthSum += p[2];
	return {
		vertices,
		totalLen: cumLen,
		avgWidth: widthSum / n,
		pointCumLen
	};
}
//#endregion
//#region src/lib/utils.ts
const segmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function" ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
function graphemes(text) {
	if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment);
	return Array.from(text);
}
/**
* Build the CSS `font-family` value for a bundle: its own family, then the
* full (non-subsetted) family when the bundle was generated from a subset,
* then the caller's `fallbackFont` — a CSS font-family list, used as-is — for
* characters neither covers.
*/
function cssFontFamily(bundle, fallbackFont) {
	const families = [`'${bundle.family}'`];
	if (bundle.fullFamily) families.push(`'${bundle.fullFamily}'`);
	if (fallbackFont?.trim()) families.push(fallbackFont.trim());
	return families.join(", ");
}
/**
* Whether a timeline draws any character from a fallback font: a grapheme
* the bundle has no glyph for, other than whitespace (which draws nothing).
*/
function drawsFallbackGlyphs(entries) {
	return entries.some((e) => !e.hasGlyph && /\S/u.test(e.char));
}
/**
* Look up `glyphData` for a grapheme cluster, with a fallback to its leading
* codepoint. Devanagari clusters like `"हि"` or `"न्दी"` have no entry in the
* single-codepoint-keyed `glyphData`; without the fallback every shaped glyph
* inside such a cluster that the variant map skipped (i.e. nominal forms like
* the bare `ह`) would resolve to `undefined`, get tagged `hasGlyph: false`,
* and collapse onto the 0.2s `unknownDuration` slot — drawn at end-of-slot
* via DOM `fillText`. The fallback resolves the cluster's first codepoint
* (e.g. `ह` from `"हि"`), so the nominal glyph picks up its real stroke data
* and animates instead of popping in.
*/
function lookupGlyphData(font, char) {
	const direct = font.glyphData[char];
	if (direct || char.length <= 1) return direct;
	const cp = char.codePointAt(0);
	if (cp === void 0) return void 0;
	return font.glyphData[String.fromCodePoint(cp)];
}
function coerceToString(value) {
	if (value == null || typeof value === "boolean") return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "bigint") return String(value);
	if (Array.isArray(value)) return value.map(coerceToString).join("");
	return "";
}
//#endregion
//#region src/lib/strokeTimeline.ts
/**
* When stroke `si` draws, in seconds relative to its glyph's slot: the
* scheduler's deferred delay if it moved the stroke, else the bundled one,
* scaled with the bundled duration by stagger's fixed `duration` — unless a
* plugin's `timing` set them (`strokeDelays` / `strokeDurations`).
*/
function strokeWindow(glyph, si, slot) {
	const stroke = glyph.s[si];
	const scale = slot.strokeTimeScale ?? 1;
	return {
		delay: slot.strokeDelays?.[si] ?? stroke.d * scale,
		duration: slot.strokeDurations?.[si] ?? stroke.a * scale
	};
}
/**
* `timeline` with its strokes drawn at new times: `times[i]` for
* `strokes[i]` (strokes of the timeline, as {@link strokeInstances} lists
* them — all of them or some). A glyph with a stroke moved gets the slot its
* strokes now span, and each of them its own delay and duration. An entry
* with no strokes given (a space, a character drawn from the fallback font, a
* glyph the layout doesn't place) keeps its distance from the end of the entry
* before it. The timeline then runs `duration` seconds, or — without one — as
* long past its last end as it did; never less than to its last end. The same
* timeline when nothing moved.
*/
function retimeTimeline(timeline, strokes, times, duration) {
	const byEntry = /* @__PURE__ */ new Map();
	const moved = /* @__PURE__ */ new Set();
	for (let i = 0; i < strokes.length; i++) {
		const s = strokes[i];
		const t = times[i] ?? s;
		let own = byEntry.get(s.entryIndex);
		if (!own) byEntry.set(s.entryIndex, own = []);
		own.push({
			si: s.strokeIndex,
			start: t.start,
			duration: t.duration
		});
		if (t.start !== s.start || t.duration !== s.duration) moved.add(s.entryIndex);
	}
	if (moved.size === 0 && (duration === void 0 || duration === timeline.totalDuration)) return timeline;
	const entries = [];
	let prevOldEnd = null;
	let prevNewEnd = 0;
	let oldLast = 0;
	let newLast = 0;
	for (let ei = 0; ei < timeline.entries.length; ei++) {
		const entry = timeline.entries[ei];
		const own = byEntry.get(ei);
		let next = entry;
		if (own && moved.has(ei)) {
			let offset = Infinity;
			let end = -Infinity;
			for (const t of own) {
				offset = Math.min(offset, t.start);
				end = Math.max(end, t.start + t.duration);
			}
			const strokeDelays = [];
			const strokeDurations = [];
			for (const t of own) {
				strokeDelays[t.si] = t.start - offset;
				strokeDurations[t.si] = t.duration;
			}
			const { strokeTimeScale: _, ...rest } = entry;
			next = {
				...rest,
				offset,
				duration: end - offset,
				strokeDelays,
				strokeDurations
			};
		} else if (!own && prevOldEnd !== null) {
			const offset = Math.max(0, prevNewEnd + entry.offset - prevOldEnd);
			if (offset !== entry.offset) next = {
				...entry,
				offset
			};
		}
		entries.push(next);
		prevOldEnd = entry.offset + entry.duration;
		prevNewEnd = next.offset + next.duration;
		oldLast = Math.max(oldLast, prevOldEnd);
		newLast = Math.max(newLast, prevNewEnd);
	}
	const total = duration ?? timeline.totalDuration + (newLast - oldLast);
	return {
		entries,
		totalDuration: Math.max(newLast, total)
	};
}
/**
* Time into a glyph's slot at timeline time `time`: clamped to the slot, then
* warped by glyph easing. Every stroke of the glyph reads its progress off
* this local time.
*/
function glyphLocalTime(time, offset, slotDuration, glyphEasing) {
	const local = Math.max(0, Math.min(time - offset, slotDuration));
	return glyphEasing && slotDuration > 0 ? glyphEasing(local / slotDuration) * slotDuration : local;
}
const PENDING = {
	state: "pending",
	linear: 0,
	progress: 0
};
/** A stroke's progress at `localTime` into its glyph's slot (see {@link glyphLocalTime}). */
function strokeProgressAt(localTime, delay, duration, strokeEasing = defaultStrokeEasing) {
	if (localTime < delay) return PENDING;
	let linear = duration > 0 ? Math.min((localTime - delay) / duration, 1) : 1;
	if (linear > .999999999) linear = 1;
	const eased = strokeEasing(linear);
	return {
		state: linear >= 1 ? "done" : "drawing",
		linear,
		progress: eased < 0 ? 0 : eased > 1 ? 1 : eased
	};
}
/** A stroke's progress at timeline time `time`. */
function sampleStroke(instance, time, timing) {
	const { entry } = instance;
	if (time < entry.offset) return PENDING;
	return strokeProgressAt(glyphLocalTime(time, entry.offset, entry.duration, timing?.glyphEasing), instance.start - entry.offset, instance.duration, timing?.strokeEasing);
}
/**
* Every stroke on the timeline, in drawing order within each glyph and glyph
* order across the text (the order the canvas paints them). Characters drawn
* from the fallback font have no strokes and no instances.
*/
function strokeInstances(timeline, font) {
	const out = [];
	const entries = timeline.entries;
	for (let ei = 0; ei < entries.length; ei++) {
		const entry = entries[ei];
		if (!entry.hasGlyph || entry.char === "\n") continue;
		const glyph = (entry.glyphId !== void 0 ? font.glyphDataById?.[entry.glyphId] : void 0) ?? lookupGlyphData(font, entry.char);
		if (!glyph) continue;
		for (let si = 0; si < glyph.s.length; si++) {
			const { delay, duration } = strokeWindow(glyph, si, entry);
			out.push({
				id: `${ei}:${si}`,
				entryIndex: ei,
				entry,
				glyph,
				strokeIndex: si,
				stroke: glyph.s[si],
				start: entry.offset + delay,
				duration
			});
		}
	}
	return out;
}
/**
* The point `len` font units along a subdivided stroke: the last vertex at or
* before it (`lastIdx`) and, when it falls inside the next sub-segment, the
* interpolated point there (`tail`). `len` past the end stops on the last vertex.
*/
function pointAlong(sub, len) {
	const { vertices } = sub;
	let lo = 0;
	let hi = vertices.length - 1;
	while (lo < hi) {
		const mid = lo + hi + 1 >>> 1;
		if (vertices[mid].cumLen <= len) lo = mid;
		else hi = mid - 1;
	}
	if (lo + 1 >= vertices.length || len <= vertices[lo].cumLen) return {
		lastIdx: lo,
		tail: null
	};
	const a = vertices[lo];
	const b = vertices[lo + 1];
	const segLen = b.cumLen - a.cumLen;
	const t = segLen > 0 ? (len - a.cumLen) / segLen : 0;
	return {
		lastIdx: lo,
		tail: {
			x: a.x + (b.x - a.x) * t,
			y: a.y + (b.y - a.y) * t,
			width: a.width + (b.width - a.width) * t,
			idx: a.idx + (b.idx - a.idx) * t,
			cumLen: len
		}
	};
}
/**
* A stroke as the bundle has it, in CSS px at `place`: its subdivided
* polyline, each point as wide as the bundle says. A point's `t` is the draw progress at
* which the pen reaches it. A dot — one point, or points that all coincide —
* is a path of one point. `null` for a stroke with no points.
*/
function rawStrokePath(stroke, sub, place) {
	const pts = stroke.p;
	if (pts.length === 0) return null;
	const { scale } = place;
	const ws = scale;
	const px = (x) => place.x + x * scale;
	const py = (y) => place.y + (y + place.ascender) * scale;
	const p0 = pts[0];
	if (isDot(stroke) || sub.vertices.length < 2 || sub.totalLen <= 0) return new StrokePath([{
		x: px(p0[0]),
		y: py(p0[1]),
		width: p0[2] * ws,
		t: 0
	}]);
	const inv = 1 / sub.totalLen;
	return new StrokePath(sub.vertices.map((v) => ({
		x: px(v.x),
		y: py(v.y),
		width: v.width * ws,
		t: v.cumLen * inv
	})));
}
function isDot(stroke) {
	const pts = stroke.p;
	const p0 = pts[0];
	return pts.length === 1 || pts.every((p) => p[0] === p0[0] && p[1] === p0[1]);
}
function strokeNibs(stroke, sub, scale) {
	const nibs = stroke.n;
	if (!nibs) return NO_NIBS;
	const out = [];
	const dot = isDot(stroke) || sub.totalLen <= 0;
	for (const nib of nibs) {
		const k = nib[0];
		const at = stroke.p[k];
		if (!at) continue;
		const j = dot ? k : nibAnchor(stroke.p, sub.pointCumLen, k, Math.max(nib[3], nib[4]) / 2);
		const anchor = stroke.p[j];
		const width = Math.max(anchor[2], .5);
		out.push({
			t: dot ? 0 : (sub.pointCumLen[j] ?? 0) / sub.totalLen,
			dx: (nib[1] + at[0] - anchor[0]) * scale,
			dy: (nib[2] + at[1] - anchor[1]) * scale,
			rx: nib[3] / 2 / width,
			ry: nib[4] / 2 / width,
			angle: nib[5]
		});
	}
	return out;
}
/**
* The point a nib of radius `r` on point `k` is sized against: `k` itself, unless the stroke is
* narrower there than the nib — a terminal where the stroke thins to nothing, its ink all nib.
* Against a width near zero, any widening of the ink (pressure below 1 evens it toward the
* stroke's mean) would swell the nib many times over, so the nearest point along the stroke at
* least `r` wide holds it instead (the later one on a tie, so it doesn't show before the pen
* nears it), or the widest point when none is.
*/
function nibAnchor(points, cumLen, k, r) {
	if (points[k][2] >= r) return k;
	const at = cumLen[k] ?? 0;
	let best = -1;
	let bestDist = Infinity;
	let widest = k;
	for (let i = 0; i < points.length; i++) {
		const w = points[i][2];
		if (w > points[widest][2]) widest = i;
		if (w < r) continue;
		const dist = Math.abs((cumLen[i] ?? 0) - at);
		if (dist < bestDist || dist === bestDist && i > k) {
			best = i;
			bestDist = dist;
		}
	}
	return best >= 0 ? best : widest;
}
const NO_NIBS = [];
/** The box a placed stroke's ink covers once drawn — its path and its nib stamps. `null` for an empty path. */
function strokeInkBounds(stroke) {
	const box = stroke.path.bounds();
	if (stroke.nibs.length === 0) return box;
	return unionBoxes([box, ...stroke.nibs.map((nib) => {
		const at = stroke.path.pointAt(nib.t);
		const r = Math.max(nib.rx, nib.ry) * at.width;
		return {
			minX: at.x + nib.dx - r,
			minY: at.y + nib.dy - r,
			maxX: at.x + nib.dx + r,
			maxY: at.y + nib.dy + r
		};
	})]);
}
/** Place every stroke in the layout. Strokes with no points, or of glyphs the layout doesn't place, are left out. */
function placeStrokes(instances, ctx) {
	const out = [];
	const subdivide = ctx.getSubdivided ?? ((s) => subdivideStroke(s, Infinity));
	let entryIndex = -1;
	let place = null;
	for (const instance of instances) {
		if (instance.entryIndex !== entryIndex) {
			entryIndex = instance.entryIndex;
			place = ctx.placeEntry(entryIndex);
		}
		if (!place) continue;
		const sub = subdivide(instance.stroke);
		const rawPath = rawStrokePath(instance.stroke, sub, place);
		if (!rawPath) continue;
		const path = ctx.reshape ? ctx.reshape(rawPath, {
			stroke: instance,
			rawPath,
			place,
			seed: place.seed,
			bundleIndexAt: (t) => {
				if (sub.totalLen <= 0) return 0;
				const { lastIdx, tail } = pointAlong(sub, sub.totalLen * t);
				return (tail ?? sub.vertices[lastIdx]).idx;
			}
		}) : rawPath;
		out.push({
			...instance,
			path,
			rawPath,
			nibs: strokeNibs(instance.stroke, sub, place.scale),
			seed: place.seed,
			place: {
				x: place.x,
				y: place.y,
				scale: place.scale,
				ascender: place.ascender
			}
		});
	}
	return out;
}
/** Sample every placed stroke at timeline time `time`. */
function sampleFrame(placed, time, timing) {
	const strokes = [];
	const active = [];
	for (const stroke of placed) {
		const sample = sampleStroke(stroke, time, timing);
		const head = sample.state === "pending" ? null : stroke.path.pointAt(sample.progress);
		const frame = {
			...stroke,
			...sample,
			head
		};
		strokes.push(frame);
		if (head && sample.state === "drawing") active.push(frame);
	}
	return {
		time,
		strokes,
		active
	};
}
//#endregion
//#region src/lib/svgExport.ts
const LOOP_HOLD = 1.5;
const LOOP_FADE = .3;
const LOOP_GAP = .7;
/** Stands in for a mask / filter region's attributes until the viewBox is known. */
const REGION = "\0REGION\0";
/** What a plugin's `svg` hook writes for a filter, mask or clip region the size of the file (see `TegakiSvgContext.region`). */
const SVG_REGION = REGION;
function fmt$2(n) {
	return (Math.round(n * 100) / 100).toString();
}
function fmtFine(n) {
	return (Math.round(n * 1e4) / 1e4).toString();
}
function escapeXml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function strokeClock(item, si, cfg) {
	const { delay, duration: dur } = strokeWindow(item.glyph, si, item);
	const slot = item.duration ?? item.glyph.t;
	const easeGlyph = cfg.glyphEasing;
	const O = item.offset;
	const at = (t) => {
		const s = strokeProgressAt(glyphLocalTime(t, O, slot, easeGlyph), delay, dur, cfg.strokeEasing);
		return s.state === "pending" ? -1 : s.progress;
	};
	if (easeGlyph && slot > 0) return {
		at,
		t0: O,
		t1: O + slot
	};
	return {
		at,
		t0: O + delay,
		t1: O + Math.max(delay, Math.min(delay + dur, slot))
	};
}
/**
* Progress keyframes (timeline seconds) that follow the clock's curve — any
* easing — as cubic Bézier segments: Hermite fits from the curve's end
* slopes, split until each is within tolerance. Ease-out quad (the default)
* is one exact segment. Control points stay in [0, 1], as SMIL requires.
*/
function progressKeys(clock) {
	const f = (t) => Math.max(0, clock.at(t));
	const start = firstTime(clock, (p) => p >= 0) ?? clock.t0;
	const final = f(clock.t1);
	const end = firstTime({
		...clock,
		t0: start
	}, (p) => p >= final) ?? clock.t1;
	if (end <= start) return [{
		t: start,
		p: 0
	}, {
		t: start,
		p: final
	}];
	const keys = [{
		t: start,
		p: f(start)
	}];
	const fit = (a, b, depth) => {
		const pa = f(a);
		const pb = f(b);
		const dp = pb - pa;
		const du = b - a;
		if (Math.abs(dp) < 1e-6) {
			keys.push({
				t: b,
				p: pb
			});
			return;
		}
		const h = du * .001;
		const ma = (-3 * pa + 4 * f(a + h) - f(a + 2 * h)) / (2 * h);
		const mb = (3 * pb - 4 * f(b - h) + f(b - 2 * h)) / (2 * h);
		const y1 = ma * (du / (3 * dp));
		const y2 = 1 - mb * (du / (3 * dp));
		let ok = y1 >= 0 && y1 <= 1 && y2 >= 0 && y2 <= 1;
		for (let i = 1; ok && i < 8; i++) {
			const u = i / 8;
			const y = 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
			if (Math.abs(pa + dp * y - f(a + du * u)) > .004) ok = false;
		}
		if (ok || depth >= 8) {
			keys.push({
				t: b,
				p: pb,
				ease: ok ? [
					1 / 3,
					y1,
					2 / 3,
					y2
				] : void 0
			});
			return;
		}
		const mid = (a + b) / 2;
		fit(a, mid, depth + 1);
		fit(mid, b, depth + 1);
	};
	fit(start, end, 0);
	return keys;
}
/** First timeline time at which `pred(progress)` holds, or null if it never does. */
function firstTime(clock, pred) {
	const { t0, t1 } = clock;
	if (pred(clock.at(t0))) return t0;
	if (t1 <= t0) return pred(clock.at(t0 + 1e-9)) ? t0 : null;
	const n = 128;
	let prev = t0;
	for (let i = 1; i <= n; i++) {
		const t = t0 + (t1 - t0) * i / n;
		if (pred(clock.at(t))) {
			let lo = prev;
			let hi = t;
			for (let k = 0; k < 24; k++) {
				const mid = (lo + hi) / 2;
				if (pred(clock.at(mid))) hi = mid;
				else lo = mid;
			}
			return hi;
		}
		prev = t;
	}
	return null;
}
const NO_ANIM = {
	attrs: "",
	inner: ""
};
var Animator = class {
	mode;
	speed;
	cycle;
	holdEndPct;
	fadeEndPct;
	keyframes = [];
	count = 0;
	constructor(cfg) {
		this.mode = cfg.loop ? "loop" : cfg.animated ? "once" : "static";
		this.speed = cfg.speed && cfg.speed > 0 ? cfg.speed : 1;
		const total = Math.max(cfg.totalDuration / this.speed, .001);
		const hold = Math.max(cfg.loopHold ?? LOOP_HOLD, 0);
		this.cycle = total + hold + LOOP_FADE + LOOP_GAP;
		this.holdEndPct = (total + hold) / this.cycle * 100;
		this.fadeEndPct = (total + hold + LOOP_FADE) / this.cycle * 100;
	}
	/** Output seconds for a timeline time. */
	out(t) {
		return t / this.speed;
	}
	pct(t) {
		return Math.min(this.out(t) / this.cycle * 100, this.holdEndPct);
	}
	/** Register a keyframe animation; a stop's timing function runs from it to the next stop. */
	keyframe(prop, stops) {
		const name = `tk-a${this.count++}`;
		const merged = /* @__PURE__ */ new Map();
		for (const [pct, v, ease] of stops) {
			const at = `${Math.round(Math.min(Math.max(pct, 0), 100) * 1e3) / 1e3}`;
			merged.set(at, `${prop}:${v}${ease ? `; animation-timing-function:${ease}` : ""}`);
		}
		const body = [...merged].map(([pct, decl]) => `${pct}% { ${decl} }`).join(" ");
		this.keyframes.push(`@keyframes ${name} { ${body} } .${name} { animation: ${name} ${fmtFine(this.cycle)}s linear infinite }`);
		return name;
	}
	/**
	* Reveal a dashed path of length `plen` (dash `L` ≥ plen + its cap) along
	* the progress keys. Hidden sits a hair past `L` so no zero-length dash
	* leaves a cap dot at the start. `lenAt` maps progress to the length drawn
	* (default: in proportion, `p * plen`).
	*/
	dash(keys, L, plen, lenAt) {
		const hidden = L + .5;
		const offset = (p) => p <= 0 ? hidden : L - (lenAt ? lenAt(p) : p * plen);
		const dashAttrs = ` stroke-dasharray="${fmt$2(L)} ${fmt$2(L)}" stroke-dashoffset="${fmt$2(hidden)}"`;
		const first = keys[0];
		const last = keys[keys.length - 1];
		const bezier = (e) => (e ?? [
			0,
			0,
			1,
			1
		]).map(fmtFine).join(" ");
		if (this.mode === "once") {
			const begin = this.out(first.t);
			const dur = this.out(last.t) - begin;
			if (dur <= 0) return {
				attrs: dashAttrs,
				inner: `<set attributeName="stroke-dashoffset" to="${fmt$2(offset(last.p))}" begin="${fmtFine(begin)}s" fill="freeze" />`
			};
			const keyTimes = keys.map((k) => fmtFine((this.out(k.t) - begin) / dur));
			keyTimes[0] = "0";
			keyTimes[keyTimes.length - 1] = "1";
			const values = keys.map((k) => fmt$2(offset(k.p)));
			const splines = keys.slice(1).map((k) => bezier(k.ease));
			return {
				attrs: dashAttrs,
				inner: `<animate attributeName="stroke-dashoffset" values="${values.join(";")}" keyTimes="${keyTimes.join(";")}" calcMode="spline" keySplines="${splines.join(";")}" dur="${fmtFine(dur)}s" begin="${fmtFine(begin)}s" fill="freeze" />`
			};
		}
		const stops = [[0, fmt$2(hidden)]];
		keys.forEach((k, i) => {
			const next = keys[i + 1]?.ease;
			stops.push([
				this.pct(k.t),
				fmt$2(offset(k.p)),
				next ? `cubic-bezier(${next.map(fmtFine).join(",")})` : void 0
			]);
		});
		const final = fmt$2(offset(last.p));
		stops.push([this.holdEndPct, final], [this.fadeEndPct, final], [this.fadeEndPct + .001, fmt$2(hidden)], [100, fmt$2(hidden)]);
		return {
			attrs: ` class="${this.keyframe("stroke-dashoffset", stops)}"${dashAttrs}`,
			inner: ""
		};
	}
	/** Show an element from timeline time `t` on. */
	appear(t) {
		if (this.mode === "static" || this.out(t) <= 5e-4) return NO_ANIM;
		if (this.mode === "once") return {
			attrs: " opacity=\"0\"",
			inner: `<set attributeName="opacity" to="1" begin="${fmtFine(this.out(t))}s" fill="freeze" />`
		};
		const on = this.pct(t);
		const stops = [
			[0, "0"],
			[on, "0"],
			[on + .001, "1"],
			[this.fadeEndPct, "1"],
			[this.fadeEndPct + .001, "0"],
			[100, "0"]
		];
		return {
			attrs: ` class="${this.keyframe("opacity", stops)}" opacity="0"`,
			inner: ""
		};
	}
	/** Loop mode's group fade class, or '' otherwise. */
	groupFade() {
		if (this.mode !== "loop") return "";
		const stops = [
			[0, "1"],
			[this.holdEndPct, "1"],
			[this.fadeEndPct, "0"],
			[100, "0"]
		];
		return this.keyframe("opacity", stops);
	}
};
function el(tag, attrs, anim) {
	return anim.inner ? `<${tag} ${attrs}${anim.attrs}>${anim.inner}</${tag}>` : `<${tag} ${attrs}${anim.attrs} />`;
}
/** An ink's nib stamps, where the canvas puts them: on its path, sized by the ink's width there. */
function inkStamps(ink, strokeScale) {
	const out = [];
	for (const nib of ink.nibs) {
		const at = ink.path.pointAt(nib.t);
		const rx = nib.rx * at.width * strokeScale;
		const ry = nib.ry * at.width * strokeScale;
		if (rx <= 0 || ry <= 0) continue;
		out.push({
			cx: at.x + nib.dx,
			cy: at.y + nib.dy,
			rx,
			ry,
			deg: nib.angle * 180 / Math.PI,
			at: nib.t
		});
	}
	return out;
}
/** The length along `pts` (cumulative lengths `cum`) the pen has drawn at progress `p`. */
function lengthAt(pts, cum, p) {
	let lo = 0;
	let hi = pts.length - 1;
	if (p <= pts[0].t) return 0;
	if (p >= pts[hi].t) return cum[hi];
	while (hi - lo > 1) {
		const m = lo + hi >> 1;
		if (pts[m].t <= p) lo = m;
		else hi = m;
	}
	const t0 = pts[lo].t;
	const t1 = pts[hi].t;
	return cum[lo] + (t1 > t0 ? (p - t0) / (t1 - t0) : 0) * (cum[hi] - cum[lo]);
}
function ellipse(s, fill, extra, anim) {
	return el("ellipse", `cx="${fmt$2(s.cx)}" cy="${fmt$2(s.cy)}" rx="${fmt$2(s.rx)}" ry="${fmt$2(s.ry)}" transform="rotate(${fmt$2(s.deg)} ${fmt$2(s.cx)} ${fmt$2(s.cy)})" fill="${fill}"${extra}`, anim);
}
function textEl(run, font, fill, extra, anim) {
	const rtl = run.direction === "rtl";
	const style = `white-space:pre;direction:${run.direction};unicode-bidi:embed${font.featureSettings ? `;font-feature-settings:${font.featureSettings}` : ""}`;
	return `<text ${`x="${fmt$2(run.x)}" y="${fmt$2(run.y)}" font-family="${escapeXml(font.family)}" font-size="${fmt$2(font.fontSize)}"${font.letterSpacing ? ` letter-spacing="${fmt$2(font.letterSpacing)}"` : ""}${rtl ? " text-anchor=\"end\"" : ""} style="${escapeXml(style)}" fill="${fill}"${extra}`}${anim.attrs}>${escapeXml(run.text)}${anim.inner}</text>`;
}
/**
* Serialize positioned glyphs to a standalone SVG string that draws what the
* canvas renderer draws: the same timing (speed, glyph and stroke easing, the
* scheduler's deferred and stretched strokes), the ink as the plugins shaped
* it (nib stamps with it), what their `svg` hooks add, clip-to-text and
* fallback characters.
*
* A stroke with one width and one paint is a dashed `<path>` revealed along
* its length. A stroke whose width or color varies is one `<line>` per
* sub-segment, as `drawGlyph` draws it, revealed through a `<mask>` whose
* centerline is dash-animated. Single play animates with SMIL; `loop` with
* CSS keyframes.
*/
function placementsToSvg(items, cfg) {
	const anim = new Animator(cfg);
	const endTime = cfg.totalDuration;
	const deco = cfg.decorate?.({
		mode: anim.mode,
		seconds: (t) => anim.out(t),
		appear: (t) => anim.appear(t)
	});
	const body = [];
	const defs = [];
	let maskId = 0;
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	const grow = (x, y, r) => {
		if (x - r < minX) minX = x - r;
		if (y - r < minY) minY = y - r;
		if (x + r > maxX) maxX = x + r;
		if (y + r > maxY) maxY = y + r;
	};
	for (const item of items) for (let si = 0; si < item.glyph.s.length; si++) {
		const ink = item.inks[si];
		const pts = ink?.path.points;
		if (!ink || !pts || pts.length === 0) continue;
		const clock = strokeClock(item, si, cfg);
		if (clock.at(Math.max(clock.t1, endTime)) < 0) continue;
		const style = item.entryIndex === void 0 ? void 0 : deco?.strokes.get(`${item.entryIndex}:${si}`);
		const styled = style?.color;
		const graded = typeof styled === "function";
		const strokePaint = typeof styled === "string" ? styled : cfg.color;
		const colorAt = (at) => graded ? styled(at) : strokePaint;
		const out = [];
		const stamps = inkStamps(ink, cfg.strokeScale);
		const p0 = pts[0];
		if (pts.length === 1 || pts.every((p) => p.x === p0.x && p.y === p0.y)) {
			const shown = firstTime(clock, (p) => p > 0);
			if (shown === null) continue;
			const reveal = anim.appear(shown);
			const cx = p0.x;
			const cy = p0.y;
			const w = p0.width * cfg.strokeScale;
			const fill = colorAt(0);
			grow(cx, cy, w / 2);
			out.push(cfg.lineCap === "round" ? el("circle", `cx="${fmt$2(cx)}" cy="${fmt$2(cy)}" r="${fmt$2(w / 2)}" fill="${fill}"`, reveal) : el("rect", `x="${fmt$2(cx - w / 2)}" y="${fmt$2(cy - w / 2)}" width="${fmt$2(w)}" height="${fmt$2(w)}" fill="${fill}"`, reveal));
			for (const s of stamps) {
				grow(s.cx, s.cy, Math.max(s.rx, s.ry));
				out.push(ellipse(s, fill, "", reveal));
			}
		} else {
			const xs = pts.map((p) => p.x);
			const ys = pts.map((p) => p.y);
			const cum = [0];
			for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
			const plen = cum[cum.length - 1];
			if (plen <= 0) continue;
			let sum = 0;
			for (const p of pts) sum += p.width;
			const base = (ink.path.uniformWidth ? p0.width : sum / pts.length) * cfg.strokeScale;
			const segmented = !ink.path.uniformWidth || graded;
			const d = `M ${fmt$2(xs[0])} ${fmt$2(ys[0])} ${xs.slice(1).map((x, i) => `L ${fmt$2(x)} ${fmt$2(ys[i + 1])}`).join(" ")}`;
			const segs = [];
			let maxW = base;
			if (segmented) {
				const last = xs.length - 1;
				for (let i = 1; i < xs.length; i++) {
					const w = (pts[i - 1].width + pts[i].width) / 2 * cfg.strokeScale;
					const mid = (pts[i - 1].t + pts[i].t) / 2;
					if (w > maxW) maxW = w;
					const color = graded ? colorAt(mid) : null;
					const end = cfg.lineCap !== "round" && (i === 1 || i === last);
					segs.push(`<line x1="${fmt$2(xs[i - 1])}" y1="${fmt$2(ys[i - 1])}" x2="${fmt$2(xs[i])}" y2="${fmt$2(ys[i])}" stroke-width="${fmt$2(w)}"${color ? ` stroke="${color}"` : ""}${end ? ` stroke-linecap="${cfg.lineCap}"` : ""} />`);
					if (end && last > 1) {
						const j = i === 1 ? i : i - 1;
						segs.push(`<circle cx="${fmt$2(xs[j])}" cy="${fmt$2(ys[j])}" r="${fmt$2(w / 2)}" fill="${color ?? strokePaint}" stroke="none" />`);
					}
				}
			}
			for (let i = 0; i < xs.length; i++) grow(xs[i], ys[i], maxW / 2);
			const coverW = maxW + 4;
			let reveal = NO_ANIM;
			if (anim.mode !== "static") {
				const keys = progressKeys(clock);
				reveal = anim.dash(keys, plen + Math.max(coverW, base) + 1, plen, (p) => lengthAt(pts, cum, p));
			}
			const pathAttrs = (color, width, cap) => `d="${d}" fill="none" stroke="${color}" stroke-width="${fmt$2(width)}" stroke-linecap="${cap}" stroke-linejoin="round"`;
			if (!segmented) out.push(el("path", pathAttrs(strokePaint, base, cfg.lineCap), reveal));
			else {
				const group = `fill="none" stroke="${strokePaint}" stroke-linecap="round" stroke-linejoin="round"`;
				if (anim.mode === "static") out.push(`<g ${group}>\n${segs.join("\n")}\n</g>`);
				else {
					const id = `tk-m${maskId++}`;
					defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" ${REGION}>${el("path", pathAttrs("#fff", coverW, "round"), reveal)}</mask>`);
					out.push(`<g mask="url(#${id})" ${group}>\n${segs.join("\n")}\n</g>`);
				}
			}
			for (const s of stamps) {
				const t = firstTime(clock, (p) => p > 0 && p >= s.at);
				if (t === null) continue;
				grow(s.cx, s.cy, Math.max(s.rx, s.ry));
				out.push(ellipse(s, colorAt(s.at), "", anim.appear(t)));
			}
		}
		if (style?.attrs && out.length > 0) body.push(`<g ${style.attrs}>\n${out.join("\n")}\n</g>`);
		else body.push(...out);
	}
	if (cfg.fallback) {
		const { font, texts } = cfg.fallback;
		let clipId = 0;
		for (const t of texts) {
			let clip = "";
			if (t.clip) {
				const id = `tk-fc${clipId++}`;
				const left = t.clip[0] ?? -1e5;
				const right = t.clip[1] ?? 1e5;
				defs.push(`<clipPath id="${id}"><rect x="${fmt$2(left)}" y="-100000" width="${fmt$2(right - left)}" height="200000" /></clipPath>`);
				clip = ` clip-path="url(#${id})"`;
			}
			const reveal = anim.appear(t.at);
			const [l, top, r, bottom] = t.box;
			grow(l, top, 0);
			grow(r, bottom, 0);
			const main = textEl(t, font, t.fill, "", reveal);
			body.push(clip ? `<g${clip}>${main}</g>` : main);
		}
	}
	for (const b of deco?.boxes ?? []) {
		grow(b.minX, b.minY, 0);
		grow(b.maxX, b.maxY, 0);
	}
	const hasInk = Number.isFinite(minX);
	let vbX = 0;
	let vbY = 0;
	let vbW = cfg.width;
	let vbH = cfg.height;
	if ((cfg.crop ?? true) && hasInk) {
		const margin = 8;
		vbX = minX - margin;
		vbY = minY - margin;
		vbW = maxX - minX + 16;
		vbH = maxY - minY + 16;
	}
	const region = `x="${fmt$2(vbX)}" y="${fmt$2(vbY)}" width="${fmt$2(vbW)}" height="${fmt$2(vbH)}"`;
	let content = body.join("\n");
	if (cfg.clipText) {
		const { glyphs = [], font, words = [] } = cfg.clipText;
		const shapes = glyphs.filter((g) => g.d).map((g) => g.placed ? `<path d="${g.d}" />` : `<path d="${g.d}" transform="translate(${fmt$2(g.x)} ${fmt$2(g.y)}) scale(${fmtFine(g.scale)} ${fmtFine(-g.scale)})" />`);
		if (font) shapes.push(...words.map((w) => textEl(w, font, "#fff", "", NO_ANIM)));
		defs.push(`<mask id="tk-clip" maskUnits="userSpaceOnUse" ${REGION}><g fill="#fff">${shapes.join("")}</g></mask>`);
		content = `<g mask="url(#tk-clip)">\n${content}\n</g>`;
	}
	if (deco) {
		defs.push(...deco.defs);
		for (const attrs of deco.ink) content = `<g ${attrs}>\n${content}\n</g>`;
		content = [content, ...deco.overlay].join("\n");
	}
	const fade = anim.groupFade();
	if (fade) content = `<g class="${fade}">\n${content}\n</g>`;
	if (deco && deco.underlay.length > 0) content = [...deco.underlay, content].join("\n");
	const css = [];
	for (const face of cfg.fontFaces ?? []) css.push(`@font-face { font-family: '${face.family.replace(/'/g, "\\'")}'; src: url("${face.src}") }`);
	css.push(...anim.keyframes);
	const head = (css.length > 0 ? `<style>${escapeXml(css.join("\n")).replace(/&quot;/g, "\"")}</style>\n` : "") + (defs.length > 0 ? `<defs>\n${defs.join("\n")}\n</defs>\n` : "");
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt$2(vbX)} ${fmt$2(vbY)} ${fmt$2(vbW)} ${fmt$2(vbH)}" width="${fmt$2(vbW)}" height="${fmt$2(vbH)}">\n${head}${content}\n</svg>`.replaceAll(REGION, region);
}
//#endregion
//#region src/core/plugins.ts
/** Plugins whose `paint` only restyles what the pen has drawn (see {@link paintsDrawnOnly}). */
const drawnOnly = /* @__PURE__ */ new WeakSet();
/**
* `factory`, making plugins whose `paint` shows nothing of a stroke the pen
* hasn't reached — a color, a glow. The engine then skips pending strokes
* for them, and needs no layer past clip-to-text on their account: work a
* plugin painting ahead of the pen (a guide, a typewriter) can't be spared.
*/
function paintsDrawnOnly(factory) {
	const make = (options) => {
		const plugin = factory(options);
		drawnOnly.add(plugin);
		return plugin;
	};
	return Object.defineProperties(make, Object.getOwnPropertyDescriptors(factory));
}
/** Whether a plugin's `paint` may show a stroke before the pen gets to it. */
function paintsAhead(plugin) {
	return !!plugin.paint && !drawnOnly.has(plugin);
}
/**
* Bring `attached` in step with `plugins`: the attached plugins it no longer
* holds are detached (in the order they were attached), then the ones with
* an `attach` hook it holds that aren't yet are attached (in list order) — a
* plugin listed twice once. An empty list detaches every one, as a destroyed
* engine does. `context` makes each attachment its `attach` context.
*/
function syncAttachments(attached, plugins, context, onError) {
	const keep = new Set(plugins);
	for (const [plugin, attachment] of attached) {
		if (keep.has(plugin)) continue;
		attached.delete(plugin);
		attachment.live = false;
		try {
			attachment.detach?.();
		} catch (error) {
			onError(plugin, "attach", error);
		}
	}
	for (const plugin of plugins) {
		if (!plugin.attach || attached.has(plugin)) continue;
		const attachment = {
			detach: void 0,
			live: true
		};
		attached.set(plugin, attachment);
		try {
			const detach = plugin.attach(context(attachment));
			if (typeof detach === "function") attachment.detach = detach;
		} catch (error) {
			onError(plugin, "attach", error);
		}
	}
}
/** `steps` made safe: a whole `count` of at least 1, and `null` when there's nothing to cycle (one drawing, or no positive, finite `fps`). */
function normalizeSteps(steps) {
	if (!steps) return null;
	const count = Math.max(1, Math.floor(Number.isFinite(steps.count) ? steps.count : 1));
	if (count < 2 || !(steps.fps > 0) || !Number.isFinite(steps.fps)) return null;
	return {
		count,
		fps: steps.fps,
		idle: steps.idle === true,
		paintOnly: steps.paintOnly === true
	};
}
/** The drawing a cycle shows at `clock` seconds: a new one every `1 / fps`, round and round. */
function stepAt(steps, clock) {
	return Math.floor(Math.max(0, clock) * steps.fps + 1e-9) % steps.count;
}
/** The plugins that cycle through drawings, with their steps made safe. */
function steppedPlugins(plugins) {
	const out = [];
	for (const plugin of plugins) {
		const steps = normalizeSteps(plugin.steps);
		if (steps) out.push({
			plugin,
			steps
		});
	}
	return out;
}
/** Each stepped plugin's drawing at `clock`, and a key naming the combination (`''` with none). */
function pluginStepsAt(plugins, clock) {
	const steps = /* @__PURE__ */ new Map();
	for (const { plugin, steps: s } of steppedPlugins(plugins)) steps.set(plugin, stepAt(s, clock));
	return {
		steps,
		key: stepsKey(steps)
	};
}
/** A key naming a combination of drawings, the same for the same steps. */
function stepsKey(steps) {
	return [...steps.values()].join(",");
}
/** Whether a plugin's steps change the ink's shape — it has `geometry` or `outline`, and its steps aren't `paintOnly`. Only those need the strokes placed once per drawing; the rest (a flicker) just paint differently. */
function shapesInk(plugin) {
	return !!(plugin.geometry || plugin.outline) && plugin.steps?.paintOnly !== true;
}
/** The steps of the plugins that shape the ink, and their key — what placed strokes and clip outlines are cached by. */
function shapeSteps(steps) {
	const out = /* @__PURE__ */ new Map();
	for (const [plugin, step] of steps) if (shapesInk(plugin)) out.set(plugin, step);
	return {
		steps: out,
		key: stepsKey(out)
	};
}
/**
* Every combination of the drawings of the stepped plugins that shape the
* ink — what the canvas must hold — or only the first `limit` of them when
* there are more (a few plugins of a few drawings each is the most anyone
* needs). A plugin whose steps only paint (no `geometry` or `outline`)
* doesn't move the ink, so it adds none.
*/
function allPluginSteps(plugins, limit = 64) {
	let combos = [/* @__PURE__ */ new Map()];
	for (const { plugin, steps } of steppedPlugins(plugins.filter(shapesInk))) {
		const next = [];
		for (const combo of combos) for (let i = 0; i < steps.count && next.length < limit; i++) next.push(new Map(combo).set(plugin, i));
		combos = next;
	}
	return combos;
}
/** Every `geometry` hook in order, as one reshape; `undefined` when no plugin has one. Each hook is told its plugin's drawing in `ctx.step`. */
function reshapeWith(plugins, extra, onError, steps) {
	const hooks = plugins.filter((p) => p.geometry);
	if (hooks.length === 0) return void 0;
	return (path, g) => {
		const ctx = {
			...g,
			...extra,
			step: 0
		};
		let out = path;
		for (const plugin of hooks) try {
			ctx.step = steps?.get(plugin) ?? 0;
			out = plugin.geometry(out, ctx) ?? out;
		} catch (error) {
			onError(plugin, "geometry", error);
		}
		return out;
	};
}
/**
* Every `timing` hook in order, as one: the strokes at the times the last
* hook gave them, and the timeline's length; `undefined` when no plugin has
* one. A hook that throws, or doesn't return a time for every stroke, is
* reported and skipped. Times are kept to zero or later.
*/
function timingWith(plugins, extra, onError) {
	const hooks = plugins.filter((p) => p.timing);
	if (hooks.length === 0) return void 0;
	return (strokes, duration) => {
		let last = lastEnd(strokes);
		for (const plugin of hooks) try {
			const out = plugin.timing({
				...extra,
				strokes,
				duration
			});
			if (!out) continue;
			const times = out.strokes;
			if (!Array.isArray(times) || times.length !== strokes.length) throw new Error(`timing returned ${Array.isArray(times) ? times.length : "no"} stroke times for ${strokes.length} strokes`);
			const next = strokes.map((s, i) => {
				const t = times[i];
				if (!t || !Number.isFinite(t.start) || !Number.isFinite(t.duration)) throw new Error(`timing gave stroke ${i} no finite start and duration`);
				const start = Math.max(0, t.start);
				const length = Math.max(0, t.duration);
				return start === s.start && length === s.duration ? s : {
					...s,
					start,
					duration: length
				};
			});
			const end = lastEnd(next);
			duration = Math.max(end, out.duration !== void 0 && Number.isFinite(out.duration) ? out.duration : duration + end - last);
			strokes = next;
			last = end;
		} catch (error) {
			onError(plugin, "timing", error);
		}
		return {
			strokes,
			duration
		};
	};
}
function lastEnd(strokes) {
	let end = 0;
	for (const s of strokes) end = Math.max(end, s.start + s.duration);
	return end;
}
/** Every `outline` hook in order, as one; `undefined` when no plugin has one. Each hook is told its plugin's drawing in `ctx.step`. */
function outlineWith(plugins, onError, steps) {
	const hooks = plugins.filter((p) => p.outline);
	if (hooks.length === 0) return void 0;
	return (contour, base) => {
		const ctx = {
			...base,
			step: 0
		};
		let out = contour;
		for (const plugin of hooks) try {
			ctx.step = steps?.get(plugin) ?? 0;
			out = plugin.outline(out, ctx) ?? out;
		} catch (error) {
			onError(plugin, "outline", error);
		}
		return out;
	};
}
/**
* What the plugins' `svg` hooks add to a file (see {@link TegakiSvgContext}),
* and the boxes of those with `bounds` too, for the crop. `strokes` are in
* the file's px, as the hooks get them.
*/
function svgDecoration(plugins, strokes, clock, base, onError) {
	const deco = {
		defs: [],
		underlay: [],
		overlay: [],
		ink: [],
		strokes: /* @__PURE__ */ new Map(),
		boxes: []
	};
	let ids = 0;
	const svg = {
		...base,
		strokes,
		region: SVG_REGION,
		mode: clock.mode,
		id: (name) => `${name}-${ids++}`,
		defs: (markup) => deco.defs.push(markup),
		underlay: (markup) => deco.underlay.push(markup),
		overlay: (markup) => deco.overlay.push(markup),
		ink: (attrs) => deco.ink.push(attrs),
		style: (stroke, style) => {
			const prev = deco.strokes.get(stroke.id);
			const attrs = [prev?.attrs, style.attrs].filter(Boolean).join(" ");
			deco.strokes.set(stroke.id, {
				color: style.color ?? prev?.color,
				attrs: attrs || void 0
			});
		},
		appear: (t) => clock.appear(t),
		seconds: (t) => clock.seconds(t)
	};
	for (const plugin of plugins) {
		if (!plugin.svg) continue;
		try {
			plugin.svg(svg);
		} catch (error) {
			onError(plugin, "svg", error);
		}
		if (!plugin.bounds) continue;
		try {
			const box = plugin.bounds({
				strokes,
				fontSize: base.fontSize
			});
			if (box) deco.boxes.push(box);
		} catch (error) {
			onError(plugin, "bounds", error);
		}
	}
	return deco;
}
/**
* Every `paint` hook as a chain: the first plugin's `next` is the second's
* hook, and the last one's is `base` (the default painter). Each hook runs
* between a save and a restore of the canvas state, and is told its
* plugin's drawing in `stroke.step`. A hook that throws before calling
* `next` has the stroke painted as if it weren't there.
*/
function paintWith(plugins, onError, base = paintStroke, steps) {
	let next = base;
	for (let i = plugins.length - 1; i >= 0; i--) {
		const plugin = plugins[i];
		if (!plugin.paint) continue;
		const inner = next;
		const step = steps?.get(plugin) ?? 0;
		next = (input) => {
			const stroke = input.step === step && input.unclipped ? input : {
				...input,
				step,
				unclipped: input.unclipped ?? input.ctx
			};
			const layer = stroke.unclipped !== stroke.ctx ? stroke.unclipped : null;
			let called = false;
			const call = (s) => {
				called = true;
				inner(s);
			};
			stroke.ctx.save();
			layer?.save();
			try {
				plugin.paint(stroke, call);
			} catch (error) {
				onError(plugin, "paint", error);
				if (!called) inner(stroke);
			}
			layer?.restore();
			stroke.ctx.restore();
		};
	}
	return next;
}
//#endregion
//#region src/lib/css-properties.ts
const CSS_TIME = "--tegaki-time";
const CSS_PROGRESS = "--tegaki-progress";
const CSS_DURATION = "--tegaki-duration";
const PADDING_H_EM = .2;
const MIN_LINE_HEIGHT_EM = 1.8;
const MIN_PADDING_V_EM = .2;
let cssPropertiesRegistered = false;
function registerCssProperties() {
	if (cssPropertiesRegistered) return;
	cssPropertiesRegistered = true;
	if (typeof CSS !== "undefined" && "registerProperty" in CSS) for (const prop of [
		CSS_TIME,
		CSS_PROGRESS,
		CSS_DURATION
	]) try {
		CSS.registerProperty({
			name: prop,
			syntax: "<number>",
			inherits: true,
			initialValue: "0"
		});
	} catch {}
}
//#endregion
//#region src/lib/textLayout.ts
const WHITESPACE_RE = /\s/u;
/**
* The words of line `lineIdx`, each anchored at its leftmost measured
* grapheme — where the browser put it, bidi order included. Redrawing text
* word by word at these anchors (the clip mask) keeps a word the canvas
* shapes differently from the DOM from shifting every word after it: the
* canvas and the DOM can disagree next to another script (Amiri's `1⁄2`
* beside Arabic measures 19px wider in canvas). Words that measured no width
* are left out.
*
* A word is split where its direction or script switches, as the shaper
* splits it into runs: bidi need not keep the halves together. `aכתב` opening
* an LTR line has its a at the left end and `כתב` at the right end, after the
* rest of the Hebrew run. Neutral characters go by the direction and script
* resolved over the line (see `resolvedDirections` / `resolvedScripts`), so
* the brackets of `Hello [مرحبا]` are pieces of their own, LTR as the DOM
* draws them — inside the Arabic piece they'd take its direction and script,
* and Amiri's wider Arabic bracket.
*/
function lineWords(layout, characters, lineIdx) {
	const indices = layout.lines[lineIdx] ?? [];
	const lineText = indices.map((idx) => characters[idx] ?? "").join("");
	const directions = resolvedDirections(lineText, layout.direction ?? "ltr");
	const scripts = resolvedScripts(lineText);
	const words = [];
	let text = "";
	let left = Infinity;
	let direction = "ltr";
	let script = null;
	const flush = () => {
		if (text && Number.isFinite(left)) words.push({
			text,
			leftEm: left,
			direction
		});
		text = "";
		left = Infinity;
	};
	let at = 0;
	for (const charIdx of indices) {
		const char = characters[charIdx] ?? "";
		const start = at;
		at += char.length;
		if (!char || WHITESPACE_RE.test(char)) {
			flush();
			continue;
		}
		const charDirection = directions[start] ?? "ltr";
		const charScript = scripts[start] ?? null;
		if (text && (charDirection !== direction || scriptsDiffer(charScript, script))) flush();
		if (!text) {
			direction = charDirection;
			script = charScript;
		}
		text += char;
		if ((layout.charWidths[charIdx] ?? 0) > 0) left = Math.min(left, layout.charOffsets[charIdx] ?? 0);
	}
	flush();
	return words;
}
/**
* The UTF-16 offsets of `text` where the layout wraps a line — after a space,
* or inside a word too long for the line (`overflow-wrap: break-word`). The
* browser reshapes the text around each (see `ShapeOptions.lineBreaks`):
* Caveat's `World` wrapped after `Hello` loses the alternates `Hello` gave
* its first letters, and Dancing Script's `wr` ligature broken as `Handw` /
* `riting` draws a plain w and a plain r. Breaks at `\n` aren't listed; the
* shaper shapes each paragraph on its own.
*/
function softBreaks(layout, text) {
	const chars = graphemes(text);
	const startU = [];
	let u = 0;
	for (const char of chars) {
		startU.push(u);
		u += char.length;
	}
	const breaks = [];
	let prev;
	for (const line of layout.lines) {
		const first = line[0];
		if (first === void 0) continue;
		if (prev !== void 0 && chars[prev] !== "\n") breaks.push(startU[first]);
		prev = line[line.length - 1];
	}
	return breaks;
}
/**
* Compute the text bounding box from a measured layout. Inputs are in CSS
* pixels. Assumes the layout's char offsets are em-relative to the left edge
* of each line (as produced by `computeTextLayout`).
*/
function computeLayoutBbox(layout, fontSize, lineHeight) {
	let maxRight = 0;
	for (const lineIndices of layout.lines) for (const charIdx of lineIndices) {
		const right = ((layout.charOffsets[charIdx] ?? 0) + (layout.charWidths[charIdx] ?? 0)) * fontSize;
		if (right > maxRight) maxRight = right;
	}
	return {
		x: 0,
		y: 0,
		width: maxRight,
		height: layout.lines.length * lineHeight
	};
}
function computeTextLayout(elOrText, fontSize, fontFamily, lineHeight, maxWidth) {
	if (typeof elOrText === "string") return measureWithTempElement(elOrText, fontFamily, fontSize, lineHeight, maxWidth);
	return measureElement(elOrText, fontSize);
}
function measureElement(el, fontSize) {
	const textNode = el.firstChild;
	if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return {
		lines: [],
		charOffsets: [],
		charWidths: []
	};
	const chars = graphemes(textNode.textContent ?? "");
	if (!chars.length) return {
		lines: [],
		charOffsets: [],
		charWidths: []
	};
	const direction = getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr";
	const elRect = el.getBoundingClientRect();
	const elLeft = elRect.left;
	const scale = el.offsetWidth > 0 ? elRect.width / el.offsetWidth : 1;
	const range = document.createRange();
	const charOffsets = [];
	const charWidths = [];
	const lines = [];
	let currentLine = [];
	let prevTop = -Infinity;
	let utf16Offset = 0;
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		if (char === "\n") {
			charOffsets.push(0);
			charWidths.push(0);
			currentLine.push(i);
			lines.push(currentLine);
			currentLine = [];
			prevTop = -Infinity;
			utf16Offset += char.length;
			continue;
		}
		range.setStart(textNode, utf16Offset);
		range.setEnd(textNode, utf16Offset + char.length);
		const rects = range.getClientRects();
		utf16Offset += char.length;
		if (rects.length === 0) {
			charOffsets.push(0);
			charWidths.push(0);
			currentLine.push(i);
			continue;
		}
		const rect = rects[rects.length - 1];
		if (currentLine.length > 0 && rect.top - prevTop > fontSize * .25 * scale) {
			lines.push(currentLine);
			currentLine = [];
		}
		if (currentLine.length === 0) prevTop = rect.top;
		charOffsets.push((rect.left - elLeft) / scale / fontSize);
		charWidths.push(rect.width / scale / fontSize);
		currentLine.push(i);
	}
	if (currentLine.length > 0) lines.push(currentLine);
	return {
		lines,
		charOffsets,
		charWidths,
		direction
	};
}
/**
* Replace `layout.charOffsets` and `charWidths` with values computed from the
* shaper's advances, while preserving the DOM's line-break decisions. When a
* `timeline` is provided, each entry's `xOffsetEm` and `yOffsetEm` are also
* filled in from the shaper's per-glyph pen-walk (mutated in place) and
* `layout.lineLefts` is populated — together they let the engine draw each
* glyph at its GPOS-positioned origin (cursive-attachment lift, mark
* attachment) instead of sharing one position per cluster.
*
* The DOM's Range API returns imprecise per-grapheme rects inside a complex-
* shaped cluster (Arabic joining, Indic conjuncts, ligatures with kern/mark
* GPOS), so strokes positioned from `rect.left` drift relative to the actual
* glyph origins the shaper produced. Using the shaper's own `ax` walk keeps
* the stroke positions aligned with the glyph ids the shaper chose.
*
* Anchors are measured from the DOM with Ranges over whole spans — the line
* (its leftmost visual pixel) and each word in it — never per grapheme:
* per-grapheme rects inside shaped clusters are not reliable enough. Word
* anchors also carry the browser's bidi ordering; see positionLineGlyphs.
*
* `letterSpacingEm` (CSS `letter-spacing` divided by font size) is inserted
* between clusters during the pen-walk so the shaper path tracks whatever the
* DOM already applied to line-breaking — the char-keyed fallback path picks it
* up automatically through the measured `charOffsets`, but the shaper rebuilds
* positions from glyph advances and would otherwise ignore it. This matches the
* browser exactly for non-joining scripts (Latin, CJK, Hebrew); for cursive
* scripts with GPOS cursive attachment (Arabic) the per-cluster HarfBuzz
* advance doesn't map linearly onto the browser's per-grapheme spacing, so the
* spaced canvas can drift slightly from the (hidden) DOM overlay — the glyphs
* are still spread apart, just not pixel-matched to the debug overlay.
*/
function applyShaperPositions(layout, el, text, fontSize, font, shaper, timeline, letterSpacingEm = 0) {
	const textNode = el.firstChild;
	if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return layout;
	const elRect = el.getBoundingClientRect();
	const elLeft = elRect.left;
	const scale = el.offsetWidth > 0 ? elRect.width / el.offsetWidth : 1;
	const range = document.createRange();
	return placeShapedGlyphs(layout, text, font, shaper, timeline, letterSpacingEm, (_lineText, _shaped, lineStartU, lineEndU) => {
		range.setStart(textNode, lineStartU);
		range.setEnd(textNode, lineEndU);
		const lineRects = range.getClientRects();
		if (lineRects.length === 0) return null;
		let lineLeftPx = Infinity;
		for (const r of lineRects) if (r.left < lineLeftPx) lineLeftPx = r.left;
		const lineLeftEm = (lineLeftPx - elLeft) / scale / fontSize;
		const spanLeftEm = (start, end) => {
			range.setStart(textNode, lineStartU + start);
			range.setEnd(textNode, lineStartU + end);
			let left = Infinity;
			for (const r of range.getClientRects()) if (r.width > 0 && r.left < left) left = r.left;
			return Number.isFinite(left) ? (left - elLeft) / scale / fontSize - lineLeftEm : void 0;
		};
		return {
			lineLeftEm,
			spanLeftEm
		};
	});
}
/**
* The shaper-positioned layout shared by the DOM path (`applyShaperPositions`,
* anchoring words where the browser put them) and the headless one
* (`headlessShapedLayout`, anchoring them by the bidi algorithm): shape each
* line, walk its glyphs from their word anchors, and write the offsets back.
*/
function placeShapedGlyphs(layout, text, font, shaper, timeline, letterSpacingEm, anchors) {
	const chars = graphemes(text);
	if (!chars.length) return layout;
	const graphemeStartU = [];
	{
		let u = 0;
		for (let i = 0; i < chars.length; i++) {
			graphemeStartU.push(u);
			u += chars[i].length;
		}
	}
	const utf16ToGrapheme = new Int32Array(text.length + 1).fill(-1);
	for (let i = 0; i < chars.length; i++) utf16ToGrapheme[graphemeStartU[i]] = i;
	utf16ToGrapheme[text.length] = chars.length;
	const charOffsets = layout.charOffsets.slice();
	const charWidths = layout.charWidths.slice();
	const lineLefts = new Array(layout.lines.length).fill(0);
	const entryQueue = /* @__PURE__ */ new Map();
	if (timeline) for (let ei = 0; ei < timeline.entries.length; ei++) {
		const e = timeline.entries[ei];
		if (e.glyphId === void 0) continue;
		const key = `${e.graphemeIndex}:${e.glyphId}`;
		const list = entryQueue.get(key);
		if (list) list.push(ei);
		else entryQueue.set(key, [ei]);
	}
	const lineSpans = layout.lines.map((lineIndices) => {
		const realIndices = lineIndices.filter((idx) => chars[idx] !== "\n");
		if (realIndices.length === 0) return null;
		const lastReal = realIndices[realIndices.length - 1];
		return [graphemeStartU[realIndices[0]], graphemeStartU[lastReal] + chars[lastReal].length];
	});
	const lineShaped = layout.lines.map(() => []);
	let paraFirst = 0;
	for (let li = 0; li < layout.lines.length; li++) {
		if (li < layout.lines.length - 1 && !layout.lines[li].some((idx) => chars[idx] === "\n")) continue;
		const members = [];
		for (let l = paraFirst; l <= li; l++) if (lineSpans[l]) members.push(l);
		paraFirst = li + 1;
		if (members.length === 0) continue;
		const paraStartU = lineSpans[members[0]][0];
		const paraEndU = lineSpans[members[members.length - 1]][1];
		const shaped = shaper.shape(text.slice(paraStartU, paraEndU), {
			letterSpaced: letterSpacingEm !== 0,
			direction: layout.direction ?? "ltr",
			scriptBefore: trailingScript(text.slice(0, paraStartU)),
			lineBreaks: members.slice(1).map((l) => lineSpans[l][0] - paraStartU)
		});
		for (const l of members) {
			const [start, end] = lineSpans[l];
			const from = start - paraStartU;
			const to = end - paraStartU;
			for (const g of shaped) if (g.cl >= from && g.cl < to) lineShaped[l].push({
				...g,
				cl: g.cl - from
			});
		}
	}
	for (let li = 0; li < layout.lines.length; li++) {
		const span = lineSpans[li];
		if (!span) continue;
		const [lineStartU, lineEndU] = span;
		const lineText = text.slice(lineStartU, lineEndU);
		const realIndices = layout.lines[li].filter((idx) => chars[idx] !== "\n");
		const shaped = lineShaped[li];
		if (shaped.length === 0) continue;
		const anchor = anchors(lineText, shaped, lineStartU, lineEndU);
		if (!anchor) continue;
		const { lineLeftEm, spanLeftEm } = anchor;
		lineLefts[li] = lineLeftEm;
		const { glyphs, clusterLeft, clusterAdvance } = positionLineGlyphs(shaped, lineText, spanLeftEm, font.unitsPerEm, letterSpacingEm);
		if (timeline) for (const { glyph: g, xEm, yEm } of glyphs) {
			const gIdx = utf16ToGrapheme[lineStartU + g.cl];
			if (gIdx === void 0 || gIdx < 0) continue;
			const ei = entryQueue.get(`${gIdx}:${g.g}`)?.shift();
			if (ei === void 0) continue;
			const entry = timeline.entries[ei];
			entry.xOffsetEm = xEm;
			entry.yOffsetEm = yEm;
		}
		const assigned = /* @__PURE__ */ new Set();
		for (const [cl, leftEm] of clusterLeft) {
			const gIdx = utf16ToGrapheme[lineStartU + cl];
			if (gIdx === void 0 || gIdx < 0) continue;
			charOffsets[gIdx] = lineLeftEm + leftEm;
			charWidths[gIdx] = clusterAdvance.get(cl) ?? charWidths[gIdx] ?? 0;
			assigned.add(gIdx);
		}
		const sortedCls = [...clusterLeft.keys()].sort((a, b) => a - b);
		for (const idx of realIndices) {
			if (assigned.has(idx)) continue;
			const u = graphemeStartU[idx] - lineStartU;
			let hostCl = -1;
			for (const cl of sortedCls) if (cl <= u) hostCl = cl;
			else break;
			if (hostCl < 0) continue;
			charOffsets[idx] = lineLeftEm + (clusterLeft.get(hostCl) ?? 0);
			charWidths[idx] = 0;
		}
	}
	return {
		...layout,
		charOffsets,
		charWidths,
		lineLefts
	};
}
/**
* Lay text out without a DOM, from the shaper: lines break at `\n` only, each
* line's words are ordered by the bidi algorithm (UAX #9 rule L2 over the
* resolved directions) and advanced by their shaped widths, and a
* right-to-left paragraph is right-aligned, as the browser would set it.
* Fills each timeline entry's `xOffsetEm` / `yOffsetEm`, as
* `applyShaperPositions` does. `widthEm` is the widest line.
*/
function headlessShapedLayout(text, font, shaper, timeline, letterSpacingEm = 0) {
	const chars = graphemes(text);
	const direction = paragraphDirection(text);
	const lines = [[]];
	for (let i = 0; i < chars.length; i++) {
		lines[lines.length - 1].push(i);
		if (chars[i] === "\n") lines.push([]);
	}
	if (lines[lines.length - 1].length === 0) lines.pop();
	const base = {
		lines,
		charOffsets: new Array(chars.length).fill(0),
		charWidths: new Array(chars.length).fill(0),
		direction
	};
	const widths = [];
	const placed = placeShapedGlyphs(base, text, font, shaper, timeline, letterSpacingEm, (lineText, shaped) => {
		const { anchors, width } = bidiWordAnchors(lineText, shaped, direction, font.unitsPerEm, letterSpacingEm);
		widths.push(width);
		return {
			lineLeftEm: 0,
			spanLeftEm: (start) => anchors.get(start)
		};
	});
	const widthEm = Math.max(0, ...widths);
	const lineLefts = placed.lineLefts ?? new Array(lines.length).fill(0);
	if (direction === "rtl") {
		let wi = 0;
		for (let li = 0; li < lines.length; li++) {
			if (!lines[li].some((idx) => chars[idx] !== "\n")) continue;
			const shift = widthEm - (widths[wi++] ?? widthEm);
			lineLefts[li] = (lineLefts[li] ?? 0) + shift;
			for (const idx of lines[li]) placed.charOffsets[idx] = (placed.charOffsets[idx] ?? 0) + shift;
		}
	}
	return {
		...placed,
		lineLefts,
		widthEm
	};
}
/**
* Visual-left anchors (em) of a shaped line's words and runs, keyed by their
* first UTF-16 offset, and the line's width. Each word — or run of one, where
* it switches font subset or direction — in logical order takes a bidi level
* from its resolved direction, and rule L2
* reverses every sequence at or above each odd level to get the visual order.
*/
function bidiWordAnchors(lineText, shaped, base, unitsPerEm, letterSpacingEm = 0) {
	const resolved = resolvedDirections(lineText, base);
	const spanOf = new Int32Array(lineText.length + 1);
	for (let u = 1; u <= lineText.length; u++) {
		const changed = WHITESPACE_RE.test(lineText[u] ?? "") !== WHITESPACE_RE.test(lineText[u - 1]);
		spanOf[u] = spanOf[u - 1] + (changed ? 1 : 0);
	}
	const spanId = (cl) => spanOf[cl] ?? -1;
	const units = [];
	let prev;
	const baseLevel = base === "rtl" ? 1 : 0;
	for (const g of shaped) {
		if (!units[units.length - 1] || !prev || g.run !== prev.run || spanId(g.cl) !== spanId(prev.cl)) {
			const dir = resolved[g.cl] ?? base;
			units.push({
				start: g.cl,
				width: 0,
				level: dir === base ? baseLevel : baseLevel + 1,
				clusters: /* @__PURE__ */ new Set()
			});
		}
		const u = units[units.length - 1];
		u.start = Math.min(u.start, g.cl);
		u.width += g.ax / unitsPerEm;
		u.clusters.add(g.cl);
		prev = g;
	}
	for (const u of units) u.width += u.clusters.size * letterSpacingEm;
	units.sort((a, b) => a.start - b.start);
	const order = units.map((_, i) => i);
	const maxLevel = Math.max(0, ...units.map((u) => u.level));
	const lowestOdd = Math.min(...units.map((u) => u.level).filter((l) => l % 2 === 1), Infinity);
	for (let level = maxLevel; level >= lowestOdd && level >= 1; level--) for (let i = 0; i < order.length;) {
		if (units[order[i]].level < level) {
			i++;
			continue;
		}
		let j = i;
		while (j < order.length && units[order[j]].level >= level) j++;
		order.splice(i, j - i, ...order.slice(i, j).reverse());
		i = j;
	}
	const anchors = /* @__PURE__ */ new Map();
	let pen = 0;
	for (const i of order) {
		const u = units[i];
		anchors.set(u.start, pen);
		pen += u.width;
	}
	return {
		anchors,
		width: pen
	};
}
/**
* Place one line's shaped glyphs. The shaper returns its runs in LOGICAL
* order, each run's glyphs already in visual order (an RTL run comes out
* right to left, its last word first). Arranging
* the words visually is the Unicode bidi algorithm's job, with the
* paragraph's base direction — which `dir="auto"` takes from the first strong
* character, so an Arabic line opening with a Latin word is laid out LTR. The
* browser has already done all of that for the overlay, so each word is
* anchored where the DOM put it (`spanLeftEm`, em from the line's left edge,
* over a UTF-16 span of `lineText`) and the shaper's advances only walk the
* glyphs inside it. A word the DOM can't measure continues from the previous
* one.
*
* A word the shaper split into several runs (`ShapedGlyph.run` — a subset or
* direction switch, as in `מדהיםa`, or a wrapped line's reshaped head) gets
* the same treatment per run: the runs
* come back in logical order, which is not the visual one when the word mixes
* directions, so each run is anchored where the DOM put it.
*
* `letterSpacingEm` is inserted before every cluster but a word's first; the
* gaps between words are in the DOM's measured positions.
*
* A `.notdef` glyph (a character no subset of the bundle's font has) is drawn
* by the browser in some other font, at an advance the shaper can't know — so
* each `.notdef` cluster, and the run of real glyphs after it, is anchored to
* the DOM like a word of its own. Walking the `.notdef` advance instead would
* pile up the glyphs of a spaceless line (CJK text in a Latin font). Its
* advance is left out of `clusterAdvance`: the DOM's width is the true one.
*/
function positionLineGlyphs(shaped, lineText, spanLeftEm, unitsPerEm, letterSpacingEm = 0) {
	const spanOf = new Int32Array(lineText.length).fill(-1);
	const spans = [];
	for (let i = 0; i < lineText.length;) {
		const ws = WHITESPACE_RE.test(lineText[i]);
		let j = i + 1;
		while (j < lineText.length && WHITESPACE_RE.test(lineText[j]) === ws) j++;
		for (let k = i; k < j; k++) spanOf[k] = spans.length;
		spans.push([i, j]);
		i = j;
	}
	const clusterStarts = [...new Set(shaped.map((g) => g.cl))].sort((a, b) => a - b);
	const clusterEnd = (cl) => {
		const spanEnd = spans[spanOf[cl] ?? -1]?.[1] ?? lineText.length;
		const next = clusterStarts.find((c) => c > cl);
		return next === void 0 ? spanEnd : Math.min(next, spanEnd);
	};
	const runOf = [];
	const runExtent = [];
	for (let i = 0; i < shaped.length; i++) {
		const g = shaped[i];
		const prev = shaped[i - 1];
		const notdef = isNotdef(g);
		if (!prev || spanOf[g.cl] !== spanOf[prev.cl] || g.run !== prev.run || notdef !== isNotdef(prev) || notdef && g.cl !== prev.cl) runExtent.push([g.cl, clusterEnd(g.cl)]);
		const extent = runExtent[runExtent.length - 1];
		extent[0] = Math.min(extent[0], g.cl);
		extent[1] = Math.max(extent[1], clusterEnd(g.cl));
		runOf.push(runExtent.length - 1);
	}
	const emPerUnit = 1 / unitsPerEm;
	const glyphs = [];
	const clusterLeft = /* @__PURE__ */ new Map();
	const clusterAdvance = /* @__PURE__ */ new Map();
	let penEm = 0;
	let penYEm = 0;
	let span = -1;
	let run = -1;
	let prevCl;
	for (let i = 0; i < shaped.length; i++) {
		const g = shaped[i];
		const gSpan = spanOf[g.cl] ?? -1;
		if (gSpan !== span) {
			span = gSpan;
			prevCl = void 0;
		}
		if (runOf[i] !== run) {
			run = runOf[i];
			const [start, end] = runExtent[run];
			const anchor = gSpan >= 0 ? spanLeftEm(start, end) : void 0;
			if (anchor !== void 0) {
				penEm = anchor;
				penYEm = 0;
				prevCl = void 0;
			}
		}
		if (prevCl !== void 0 && g.cl !== prevCl) penEm += letterSpacingEm;
		prevCl = g.cl;
		const xEm = penEm + g.dx * emPerUnit;
		const yEm = penYEm - g.dy * emPerUnit;
		glyphs.push({
			glyph: g,
			xEm,
			yEm
		});
		if (!clusterLeft.has(g.cl)) clusterLeft.set(g.cl, penEm);
		if (!isNotdef(g)) clusterAdvance.set(g.cl, (clusterAdvance.get(g.cl) ?? 0) + g.ax * emPerUnit);
		penEm += g.ax * emPerUnit;
		penYEm -= g.ay * emPerUnit;
	}
	return {
		glyphs,
		clusterLeft,
		clusterAdvance
	};
}
/** Glyph id 0 of any subset (`"0"`, `"1:0"`) — the font has no glyph for the character. */
function isNotdef(g) {
	return g.g === "0" || g.g.endsWith(":0");
}
function measureWithTempElement(text, fontFamily, fontSize, lineHeight, maxWidth) {
	const el = document.createElement("div");
	el.style.position = "absolute";
	el.style.left = "-9999px";
	el.style.top = "-9999px";
	el.style.visibility = "hidden";
	el.style.fontFamily = fontFamily;
	el.style.fontSize = `${fontSize}px`;
	el.style.lineHeight = `${lineHeight}px`;
	el.style.whiteSpace = "pre-wrap";
	el.style.overflowWrap = "break-word";
	el.style.width = `${maxWidth}px`;
	el.textContent = text;
	document.body.appendChild(el);
	const result = measureElement(el, fontSize);
	document.body.removeChild(el);
	return result;
}
//#endregion
//#region src/lib/timeline.ts
const DEFAULTS = {
	glyphGap: .1,
	wordGap: .15,
	lineGap: .3,
	unknownDuration: .2,
	deferDots: true
};
/**
* `shapeOptions` must describe the text as it is laid out (letter-spaced or
* not) so the shaper picks the glyphs the DOM draws. So must `softBreaks`:
* the UTF-16 offsets where the layout wraps a line (see `softBreaks` in
* textLayout.ts). The browser reshapes the text around a wrap — no ligature
* or contextual form spans it — and so does the timeline (see
* `ShapeOptions.lineBreaks`).
*/
function computeTimeline(text, font, config, shaper, shapeOptions, softBreaks) {
	if (shaper && font.glyphDataById) return computeShapedTimeline(text, font, config, shaper, shapeOptions, softBreaks);
	return computeGraphemeTimeline(text, font, config);
}
/** Parse a stagger advance value into seconds, given the previous glyph's bundled duration. */
function resolveAdvance(advance, prevBundled) {
	if (typeof advance === "number") return Math.max(0, advance);
	const m = /^(-?\d+(?:\.\d+)?)\s*%$/.exec(advance);
	if (m) {
		const pct = Number(m[1]) / 100;
		return Math.max(0, pct * prevBundled);
	}
	const n = Number(advance);
	return Number.isFinite(n) ? Math.max(0, n) : 0;
}
var StaggerScheduler = class {
	wordGap;
	lineGap;
	advance;
	staticDuration;
	entries = [];
	offset = 0;
	/**
	* Effective duration of the most recent glyph (= `staticDuration` when set,
	* else its bundled `glyph.t`). Basis for percent advances — so
	* `advance: '100%'` always means "start once the previous glyph finishes",
	* independent of whether the duration was overridden.
	*/
	prevEffective = 0;
	hasPrev = false;
	/** Accumulated word/line gap pending until the next glyph (or finalize). */
	pendingGap = 0;
	constructor(wordGap, lineGap, advance, staticDuration) {
		this.wordGap = wordGap;
		this.lineGap = lineGap;
		this.advance = advance;
		this.staticDuration = staticDuration;
	}
	addGlyph(fields, bundledDuration) {
		if (this.hasPrev) {
			this.offset += resolveAdvance(this.advance, this.prevEffective) + this.pendingGap;
			this.pendingGap = 0;
		}
		const duration = this.staticDuration ?? bundledDuration;
		const strokeTimeScale = bundledDuration > 0 ? duration / bundledDuration : 1;
		this.entries.push({
			...fields,
			offset: this.offset,
			duration,
			...strokeTimeScale !== 1 ? { strokeTimeScale } : {}
		});
		this.prevEffective = duration;
		this.hasPrev = true;
	}
	/** Emit a zero-duration marker (e.g. whitespace) at the current offset without advancing the cursor. */
	addMarker(fields) {
		this.entries.push({
			...fields,
			offset: this.offset,
			duration: 0
		});
	}
	separator(sep) {
		this.pendingGap += sep === "line" ? this.lineGap : this.wordGap;
	}
	finalize() {
		let total = 0;
		for (const e of this.entries) {
			const end = e.offset + e.duration;
			if (end > total) total = end;
		}
		return {
			entries: this.entries,
			totalDuration: total
		};
	}
};
/**
* Priorities in (−1, 0) are CONNECTING strokes — a Devanagari/Bengali
* headline — whose per-glyph pieces join into one line across the word, so
* their phase runs glyph to glyph without a gap. Marks (−1 and below) keep
* the glyph gap between glyphs.
*/
const isConnectingTier = (priority) => priority > -1 && priority < 0;
/** Decompose a glyph into a body phase and its deferred tiers (one phase each). */
function partitionGlyph(glyph, fallbackTotal, deferDots) {
	const strokes = glyph.s;
	let bodyDuration = 0;
	const byPriority = /* @__PURE__ */ new Map();
	for (let i = 0; i < strokes.length; i++) {
		const s = strokes[i];
		const end = s.d + s.a;
		const priority = s.r ?? 0;
		if (deferDots && priority < 0) {
			let tier = byPriority.get(priority);
			if (!tier) byPriority.set(priority, tier = {
				priority,
				duration: 0,
				minD: Infinity,
				maxEnd: 0,
				indices: [],
				delays: []
			});
			tier.indices.push(i);
			tier.delays.push(s.d);
			if (s.d < tier.minD) tier.minD = s.d;
			if (end > tier.maxEnd) tier.maxEnd = end;
		} else if (end > bodyDuration) bodyDuration = end;
	}
	if (byPriority.size === 0 || bodyDuration === 0) return {
		bodyDuration: glyph.t ?? fallbackTotal,
		tiers: []
	};
	const tiers = [...byPriority.values()].sort((a, b) => b.priority - a.priority).map(({ maxEnd, ...tier }) => ({
		...tier,
		duration: maxEnd - tier.minD
	}));
	return {
		bodyDuration,
		tiers
	};
}
var Scheduler = class {
	glyphGap;
	wordGap;
	lineGap;
	entries = [];
	group = [];
	offset = 0;
	/** Gap appended by the last `separate` call; stripped on `finalize` when no further content followed. */
	lastGap = 0;
	constructor(glyphGap, wordGap, lineGap) {
		this.glyphGap = glyphGap;
		this.wordGap = wordGap;
		this.lineGap = lineGap;
	}
	add(p) {
		this.lastGap = 0;
		this.group.push(p);
	}
	/**
	* Close the current word group and advance by a separator gap. Optionally
	* emits a zero-width marker entry (e.g. a whitespace grapheme / cluster)
	* between the group end and the gap.
	*/
	separate(sep, marker) {
		this.flushGroup();
		if (marker) {
			this.entries.push({
				...marker.fields,
				offset: this.offset,
				duration: marker.duration
			});
			this.offset += marker.duration;
		}
		const gap = sep === "line" ? this.lineGap : this.wordGap;
		this.offset += gap;
		this.lastGap = gap;
	}
	finalize() {
		this.flushGroup();
		return {
			entries: this.entries,
			totalDuration: Math.max(0, this.offset - this.lastGap)
		};
	}
	flushGroup() {
		if (this.group.length === 0) return;
		const group = this.group;
		const bodyStarts = new Array(group.length);
		let cursor = this.offset;
		for (let i = 0; i < group.length; i++) {
			bodyStarts[i] = cursor;
			cursor += group[i].bodyDuration;
			if (i < group.length - 1) cursor += this.glyphGap;
		}
		const bodyEnd = cursor;
		const priorities = [...new Set(group.flatMap((p) => p.tiers.map((t) => t.priority)))].sort((a, b) => b - a);
		const tierStarts = group.map(() => /* @__PURE__ */ new Map());
		let groupEnd = bodyEnd;
		for (const priority of priorities) {
			const gap = isConnectingTier(priority) ? 0 : this.glyphGap;
			cursor = groupEnd + this.glyphGap;
			for (let i = 0; i < group.length; i++) {
				const tier = group[i].tiers.find((t) => t.priority === priority);
				if (!tier) continue;
				tierStarts[i].set(priority, cursor);
				cursor += tier.duration + gap;
			}
			groupEnd = cursor - gap;
		}
		for (let i = 0; i < group.length; i++) {
			const p = group[i];
			const bodyStart = bodyStarts[i];
			let strokeDelays;
			let endTime = bodyStart + p.bodyDuration;
			for (const tier of p.tiers) {
				const tierStart = tierStarts[i].get(tier.priority);
				strokeDelays ??= [];
				for (let k = 0; k < tier.indices.length; k++) strokeDelays[tier.indices[k]] = tierStart - bodyStart + (tier.delays[k] - tier.minD);
				endTime = Math.max(endTime, tierStart + tier.duration);
			}
			this.entries.push({
				...p.fields,
				offset: bodyStart,
				duration: endTime - bodyStart,
				...strokeDelays ? { strokeDelays } : {}
			});
		}
		this.group.length = 0;
		this.offset = groupEnd;
		this.lastGap = 0;
	}
};
function computeGraphemeTimeline(text, font, config) {
	const glyphGap = config?.glyphGap ?? DEFAULTS.glyphGap;
	const wordGap = config?.wordGap ?? DEFAULTS.wordGap;
	const lineGap = config?.lineGap ?? DEFAULTS.lineGap;
	const unknownDuration = config?.unknownDuration ?? DEFAULTS.unknownDuration;
	const deferDots = config?.deferDots ?? DEFAULTS.deferDots;
	const chars = graphemes(text);
	if (config?.stagger) {
		const staticDur = config.stagger.duration === "auto" || config.stagger.duration === void 0 ? void 0 : config.stagger.duration;
		const sched = new StaggerScheduler(wordGap, lineGap, config.stagger.advance, staticDur);
		for (let i = 0; i < chars.length; i++) {
			const char = chars[i];
			const isLineBreak = char === "\n";
			const isWhitespace = !isLineBreak && /^\s+$/.test(char);
			if (isLineBreak) {
				sched.separator("line");
				continue;
			}
			if (isWhitespace) {
				sched.addMarker({
					char,
					graphemeIndex: i,
					hasGlyph: false
				});
				sched.separator("word");
				continue;
			}
			const glyph = lookupGlyphData(font, char);
			if (glyph) sched.addGlyph({
				char,
				graphemeIndex: i,
				hasGlyph: true
			}, glyph.t ?? unknownDuration);
			else sched.addGlyph({
				char,
				graphemeIndex: i,
				hasGlyph: false
			}, unknownDuration);
		}
		return sched.finalize();
	}
	const sched = new Scheduler(glyphGap, wordGap, lineGap);
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		const isLineBreak = char === "\n";
		const isWhitespace = !isLineBreak && /^\s+$/.test(char);
		if (isLineBreak) {
			sched.separate("line");
			continue;
		}
		if (isWhitespace) {
			sched.separate("word", {
				fields: {
					char,
					graphemeIndex: i,
					hasGlyph: false
				},
				duration: 0
			});
			continue;
		}
		const glyph = lookupGlyphData(font, char);
		if (glyph) {
			const part = partitionGlyph(glyph, unknownDuration, deferDots);
			sched.add({
				fields: {
					char,
					graphemeIndex: i,
					hasGlyph: true
				},
				...part
			});
		} else sched.add({
			fields: {
				char,
				graphemeIndex: i,
				hasGlyph: false
			},
			bodyDuration: unknownDuration,
			tiers: []
		});
	}
	return sched.finalize();
}
function computeShapedTimeline(text, font, config, shaper, shapeOptions, softBreaks = []) {
	const glyphGap = config?.glyphGap ?? DEFAULTS.glyphGap;
	const wordGap = config?.wordGap ?? DEFAULTS.wordGap;
	const lineGap = config?.lineGap ?? DEFAULTS.lineGap;
	const unknownDuration = config?.unknownDuration ?? DEFAULTS.unknownDuration;
	const deferDots = config?.deferDots ?? DEFAULTS.deferDots;
	const chars = graphemes(text);
	const utf16ToGrapheme = new Int32Array(text.length + 1).fill(-1);
	{
		let u = 0;
		for (let i = 0; i < chars.length; i++) {
			utf16ToGrapheme[u] = i;
			u += chars[i].length;
		}
		utf16ToGrapheme[text.length] = chars.length;
	}
	const staggerSched = config?.stagger ? new StaggerScheduler(wordGap, lineGap, config.stagger.advance, config.stagger.duration === "auto" || config.stagger.duration === void 0 ? void 0 : config.stagger.duration) : null;
	const sched = staggerSched ? null : new Scheduler(glyphGap, wordGap, lineGap);
	let lineStart = 0;
	for (let i = 0; i <= text.length; i++) {
		const atEnd = i === text.length;
		if (!atEnd && text[i] !== "\n") continue;
		const lineText = text.slice(lineStart, i);
		if (lineText.length > 0) {
			const lineBreaks = softBreaks.filter((b) => b > lineStart && b < i).map((b) => b - lineStart);
			const shaped = shaper.shape(lineText, {
				...shapeOptions,
				scriptBefore: trailingScript(text.slice(0, lineStart)),
				lineBreaks
			});
			const order = shaped.map((_, idx) => idx);
			order.sort((a, b) => shaped[a].cl - shaped[b].cl || a - b);
			for (let k = 0; k < order.length; k++) {
				const glyph = shaped[order[k]];
				const clusterStart = lineStart + glyph.cl;
				const nextOrder = k + 1 < order.length ? order[k + 1] : -1;
				const clusterEnd = nextOrder >= 0 ? lineStart + shaped[nextOrder].cl : i;
				const graphemeIdx = utf16ToGrapheme[clusterStart] ?? -1;
				if (graphemeIdx < 0) continue;
				const clusterText = text.slice(clusterStart, clusterEnd);
				const firstChar = chars[graphemeIdx];
				const isWhitespace = /^\s+$/.test(clusterText);
				const data = font.glyphDataById?.[glyph.g] ?? lookupGlyphData(font, firstChar);
				const hasGlyph = !!data;
				if (isWhitespace) {
					if (staggerSched) {
						staggerSched.addMarker({
							char: firstChar,
							graphemeIndex: graphemeIdx,
							glyphId: glyph.g,
							hasGlyph
						});
						staggerSched.separator("word");
					} else sched.separate("word", {
						fields: {
							char: firstChar,
							graphemeIndex: graphemeIdx,
							glyphId: glyph.g,
							hasGlyph
						},
						duration: 0
					});
					continue;
				}
				if (staggerSched) {
					const bundled = hasGlyph && data ? data.t ?? unknownDuration : unknownDuration;
					staggerSched.addGlyph({
						char: firstChar,
						graphemeIndex: graphemeIdx,
						glyphId: glyph.g,
						hasGlyph: !!(hasGlyph && data)
					}, bundled);
				} else if (hasGlyph && data) {
					const part = partitionGlyph(data, unknownDuration, deferDots);
					sched.add({
						fields: {
							char: firstChar,
							graphemeIndex: graphemeIdx,
							glyphId: glyph.g,
							hasGlyph: true
						},
						...part
					});
				} else sched.add({
					fields: {
						char: firstChar,
						graphemeIndex: graphemeIdx,
						glyphId: glyph.g,
						hasGlyph: false
					},
					bodyDuration: unknownDuration,
					tiers: []
				});
			}
		}
		if (!atEnd) {
			if (staggerSched) staggerSched.separator("line");
			else sched.separate("line");
			lineStart = i + 1;
		}
	}
	return staggerSched ? staggerSched.finalize() : sched.finalize();
}
//#endregion
//#region src/core/createPlugin.ts
/**
* Define a plugin that takes options. The factory it returns makes a plugin
* per call, with the options passed over the defaults:
*
* ```ts
* const shadow = createPlugin({
*   name: 'shadow',
*   params: {
*     offset: { type: 'number', default: 4, min: 0, max: 20 },
*     color: { type: 'color', default: 'rgba(40, 80, 200, 0.35)' },
*   },
*   setup: ({ offset, color }) => ({
*     paint(s, next) {
*       const path = s.stroke.path.map((p) => ({ ...p, x: p.x + offset, y: p.y + offset }));
*       next({ ...s, style: color, stroke: { ...s.stroke, path } });
*       next(s);
*     },
*   }),
* });
*
* plugins: [shadow({ offset: 8 })]
* ```
*
* The params describe the options well enough for a UI to build a control
* for each (the studio's Plugins tab does), and {@link TegakiPluginFactory.resolve}
* makes options read from a URL or a file safe to pass.
*/
function createPlugin(definition) {
	const params = definition.params ?? {};
	const defaults = pluginDefaults(params);
	const resolve = (input) => resolvePluginOptions(params, input);
	const factory = (options) => ({
		...definition.setup(resolve(options)),
		name: definition.name
	});
	Object.defineProperty(factory, "name", { value: definition.name });
	return Object.assign(factory, {
		label: definition.label ?? definition.name,
		description: definition.description,
		params,
		defaults,
		presets: definition.presets ?? {},
		resolve,
		changed: (input) => input && typeof input === "object" ? changedPluginOptions(params, input) : {}
	});
}
/** Each param's default. */
function pluginDefaults(params) {
	const out = {};
	for (const [key, param] of Object.entries(params)) out[key] = defaultOf(param);
	return out;
}
/** A param's default as {@link resolveParam} would give it back: a colors list copied, a length in its param's unit written bare. */
function defaultOf(param) {
	if (param.type === "colors") return [...param.default];
	if (param.type === "length") return resolveParam(param, param.default) ?? param.default;
	return param.default;
}
const LENGTH = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(px|em)?\s*$/i;
/** A length's number and unit (`undefined` for a bare number or a string without one), or `undefined` if it isn't a length. */
function parseLength(value) {
	if (typeof value === "number") return Number.isFinite(value) ? {
		value,
		unit: void 0
	} : void 0;
	if (typeof value !== "string") return void 0;
	const m = LENGTH.exec(value);
	if (!m) return void 0;
	const n = Number(m[1]);
	return Number.isFinite(n) ? {
		value: n,
		unit: m[2]?.toLowerCase()
	} : void 0;
}
/**
* A length in px at `fontSize`: `'8px'` is 8, `'0.1em'` 0.1 × `fontSize`, and
* a bare number is in `unit` (default `'em'`, a length param's default). What
* isn't a length is 0.
*
* ```ts
* setup: ({ radius }) => ({ paint(s, next) { const r = lengthToPx(radius, s.fontSize); … } })
* ```
*/
function lengthToPx(length, fontSize, unit = "em") {
	const parsed = parseLength(length);
	if (!parsed) return 0;
	return (parsed.unit ?? unit) === "em" ? parsed.value * fontSize : parsed.value;
}
/** Whether two param values are the same: a colors list by its colors, anything else by value. */
function sameValue(a, b) {
	if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => v === b[i]);
	return a === b;
}
/** The values a select param can take. */
function selectValues(param) {
	return param.options.map((o) => typeof o === "string" ? o : o.value);
}
/** `value` as `param` takes it, or `undefined` if it can't: a number kept in range, a length too (in its param's unit, written bare), a select value among the options. */
function resolveParam(param, value) {
	switch (param.type) {
		case "number":
			if (typeof value !== "number" || !Number.isFinite(value)) return void 0;
			return Math.min(param.max ?? Infinity, Math.max(param.min ?? -Infinity, value));
		case "length": {
			const parsed = parseLength(value);
			if (!parsed) return void 0;
			const unit = param.unit ?? "em";
			if ((parsed.unit ?? unit) === unit || parsed.value === 0) return Math.min(param.max ?? Infinity, Math.max(param.min ?? -Infinity, parsed.value));
			return `${(param.min ?? -Infinity) >= 0 ? Math.max(0, parsed.value) : parsed.value}${parsed.unit}`;
		}
		case "boolean": return typeof value === "boolean" ? value : void 0;
		case "select": return typeof value === "string" && selectValues(param).includes(value) ? value : void 0;
		case "color": return typeof value === "string" && value.length > 0 ? value : void 0;
		case "text": return typeof value === "string" ? value : void 0;
		case "colors": return Array.isArray(value) && value.every((c) => typeof c === "string" && c.length > 0) ? [...value] : void 0;
	}
}
/** Every param set from `input` (see {@link TegakiPluginFactory.resolve}). */
function resolvePluginOptions(params, input) {
	const given = input && typeof input === "object" ? input : {};
	const out = {};
	for (const [key, param] of Object.entries(params)) out[key] = (Object.hasOwn(given, key) ? resolveParam(param, given[key]) : void 0) ?? defaultOf(param);
	return out;
}
/** The options in `options` that differ from their params' defaults — what's worth writing down (in a URL, say). */
function changedPluginOptions(params, options) {
	const out = {};
	const resolved = resolvePluginOptions(params, options);
	for (const [key, param] of Object.entries(params)) if (Object.hasOwn(options, key) && !sameValue(resolved[key], defaultOf(param))) out[key] = resolved[key];
	return out;
}
//#endregion
//#region src/plugins/groups.ts
/** A gap between two glyphs this wide, in ems, is a space between words — narrower only if a character is left out between them. */
const WORD_GAP = .35;
const SPACE_GAP = .08;
const baselineOf = (s) => s.place.y + s.place.ascender * s.place.scale;
/**
* The strokes gathered into words, lines or the whole text, in text order.
* A line is the glyphs on one baseline. Words split a line where the text
* leaves a character undrawn between two glyphs (a space) and they sit apart
* — a ligature spans characters but not a gap — or where they sit far
* apart. Text without spaces (Chinese, Japanese) is a word per line.
* Nothing about time: strokes are grouped by where they are.
*/
function groupStrokes(strokes, by, fontSize) {
	const glyphs = /* @__PURE__ */ new Map();
	strokes.forEach((s, i) => {
		let g = glyphs.get(s.entryIndex);
		if (!g) {
			const left = s.place.x;
			const right = s.place.x + s.glyph.w * s.place.scale;
			g = {
				entryIndex: s.entryIndex,
				members: [],
				baseline: baselineOf(s),
				left,
				right,
				char: s.entry.graphemeIndex
			};
			glyphs.set(s.entryIndex, g);
		}
		g.members.push(i);
	});
	const ordered = [...glyphs.values()].sort((a, b) => a.entryIndex - b.entryIndex);
	const lineKeys = [...new Set(ordered.map((g) => Math.round(g.baseline * 4)))].sort((a, b) => a - b);
	const lineOf = (g) => lineKeys.indexOf(Math.round(g.baseline * 4));
	const runs = [];
	let run = [];
	for (const g of ordered) {
		const prev = run[run.length - 1];
		let split = false;
		if (prev) {
			if (by !== "text" && lineOf(prev) !== lineOf(g)) split = true;
			else if (by === "words") {
				const gap = Math.max(g.left, prev.left) - Math.min(g.right, prev.right);
				const skipped = g.char > prev.char + 1;
				split = gap > WORD_GAP * fontSize || skipped && gap > SPACE_GAP * fontSize;
			}
		}
		if (split) {
			runs.push(run);
			run = [];
		}
		run.push(g);
	}
	if (run.length > 0) runs.push(run);
	return runs.map((glyphsOfRun) => {
		const members = glyphsOfRun.flatMap((g) => g.members).sort((a, b) => a - b);
		const first = glyphsOfRun[0];
		const last = glyphsOfRun[glyphsOfRun.length - 1];
		const ink = unionBoxes(members.map((i) => strokes[i].path.bounds())) ?? {
			minX: first.left,
			minY: first.baseline,
			maxX: last.right,
			maxY: first.baseline
		};
		const lineStart = Math.min(...glyphsOfRun.map(lineOf));
		const onFirstLine = glyphsOfRun.filter((g) => lineOf(g) === lineStart);
		return {
			members,
			glyphs: glyphsOfRun.map((g) => g.entryIndex),
			line: lineStart,
			baseline: onFirstLine[0].baseline,
			ink,
			left: Math.min(...glyphsOfRun.map((g) => g.left)),
			right: Math.max(...glyphsOfRun.map((g) => g.right)),
			rtl: glyphsOfRun.length > 1 && first.left > last.left
		};
	});
}
//#endregion
//#region src/plugins/annotate.ts
/** The marks that run along a line of text rather than round what they mark: a mark per line, even for the whole text. */
const ALONG = /* @__PURE__ */ new Set([
	"underline",
	"double",
	"highlight",
	"strike"
]);
/** Seconds between one mark and the next, when they're drawn one after another. */
const GAP = .08;
/** How strongly a highlighter's ink shows. */
const HIGHLIGHT_ALPHA = .42;
/** The groups the marks go on: which of the text's words, lines, or the text itself, with `pick` applied. */
function annotatedGroups(strokes, o, fontSize) {
	const groups = groupStrokes(strokes, o.target === "text" && ALONG.has(o.mark) ? "lines" : o.target, fontSize);
	if (o.pick <= 0) return groups;
	const one = groups[Math.round(o.pick) - 1];
	return one ? [one] : [];
}
const endOf = (s) => s.start + s.duration;
/**
* When each mark is drawn, from the strokes' times: `'after'` one after
* another once the last stroke is written, `'each'` as soon as the last of
* its group's strokes is — for strokes already retimed to make room for them
* (see {@link annotateTiming}).
*/
function annotationStarts(strokes, groups, o) {
	if (o.when === "each") return groups.map((g) => Math.max(...g.members.map((i) => endOf(strokes[i]))) + o.delay);
	const end = strokes.reduce((m, s) => Math.max(m, endOf(s)), 0);
	return groups.map((_, k) => end + o.delay + k * (o.duration + GAP));
}
/**
* The strokes' times with room made for the marks, and how long the
* timeline then runs (its pause at the end kept). `'after'` leaves the
* strokes be and runs the timeline on past the marks; `'each'` holds the
* writing back after each marked group while its mark is drawn.
*/
function annotateTiming(strokes, groups, duration, o) {
	const lastEnd = strokes.reduce((m, s) => Math.max(m, endOf(s)), 0);
	const tail = Math.max(0, duration - lastEnd);
	let times = strokes.map((s) => ({
		start: s.start,
		duration: s.duration
	}));
	if (o.when === "each") {
		const ends = groups.map((g) => ({
			g,
			end: Math.max(...g.members.map((i) => endOf(strokes[i])))
		})).sort((a, b) => a.end - b.end);
		const hold = o.delay + o.duration;
		times = strokes.map((s, i) => {
			let shift = 0;
			for (const { g, end } of ends) if (!g.members.includes(i) && s.start >= end - 1e-9) shift += hold;
			return {
				start: s.start + shift,
				duration: s.duration
			};
		});
	}
	const marksEnd = annotationStarts(times, groups, o).reduce((m, t) => Math.max(m, t + o.duration), 0);
	const end = Math.max(marksEnd, times.reduce((m, s) => Math.max(m, endOf(s)), 0));
	return {
		strokes: times,
		duration: end + tail
	};
}
const signed = (random) => random() * 2 - 1;
/** Points into a path, `t` by the distance along it. */
function toPath(pts) {
	const along = [0];
	for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
	const total = along[along.length - 1] || 1;
	return new StrokePath(pts.map((p, i) => ({
		...p,
		t: along[i] / total
	})));
}
/** A pen's width along a mark, `t` 0–1: it presses in, and lifts off a little thinner. */
const pressure = (t) => .55 + .45 * Math.sin(Math.PI * Math.min(1, .15 + t * .9)) ** .6;
/**
* A line drawn by hand from (x0, y0) to (x1, y1): bowed a little, wavering,
* pressed in and lifted off. `rough` (0–1) is how loosely.
*/
function handLine(x0, y0, x1, y1, width, rough, random, even = false) {
	const len = Math.hypot(x1 - x0, y1 - y0);
	const nx = len > 0 ? -(y1 - y0) / len : 0;
	const ny = len > 0 ? (x1 - x0) / len : 1;
	const bow = rough * len * .025 * signed(random);
	const waver = rough * width * .5;
	const f1 = 2 + random() * 3;
	const p1 = random() * Math.PI * 2;
	const n = Math.max(8, Math.min(48, Math.round(len / (width * 1.5))));
	const pts = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const off = bow * Math.sin(Math.PI * t) + waver * Math.sin(f1 * Math.PI * t + p1);
		pts.push({
			x: x0 + (x1 - x0) * t + nx * off,
			y: y0 + (y1 - y0) * t + ny * off,
			width: even ? width : width * pressure(t)
		});
	}
	return toPath(pts);
}
/**
* An ellipse drawn round `box` by hand, clockwise from its upper left: a
* little lopsided, and running on past where it started, a touch wider, so
* its ends don't meet.
*/
function handEllipse(box, width, rough, random) {
	const cx = (box.minX + box.maxX) / 2;
	const cy = (box.minY + box.maxY) / 2;
	const rx = (box.maxX - box.minX) / 2 * 1.12;
	const ry = (box.maxY - box.minY) / 2 * 1.22;
	const start = -2.3 + .3 * signed(random);
	const sweep = Math.PI * 2 * (1.04 + rough * (.06 + .1 * random()));
	const lopsided = rough * .06;
	const phase = random() * Math.PI * 2;
	const spiral = rough * .08;
	const n = 64;
	const pts = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const a = start + sweep * t;
		const k = (1 + lopsided * Math.sin(2 * a + phase)) * (1 - spiral / 2 + spiral * t);
		pts.push({
			x: cx + Math.cos(a) * rx * k,
			y: cy + Math.sin(a) * ry * k,
			width: width * pressure(t)
		});
	}
	return toPath(pts);
}
/** A box drawn round `box` in one stroke from its upper left, clockwise, its corners a little off and its last side running past the first corner. */
function handBox(box, width, rough, random, fontSize) {
	const off = () => rough * .04 * fontSize * signed(random);
	const corners = [
		{
			x: box.minX + off(),
			y: box.minY + off()
		},
		{
			x: box.maxX + off(),
			y: box.minY + off()
		},
		{
			x: box.maxX + off(),
			y: box.maxY + off()
		},
		{
			x: box.minX + off(),
			y: box.maxY + off()
		}
	];
	const over = {
		x: corners[0].x + (.02 + rough * .06) * fontSize,
		y: corners[0].y - rough * .05 * fontSize
	};
	const sides = [
		corners[0],
		corners[1],
		corners[2],
		corners[3],
		over
	];
	const pts = [];
	for (let s = 0; s < 4; s++) {
		const a = sides[s];
		const b = sides[s + 1];
		const side = handLine(a.x, a.y, b.x, b.y, width, rough * .6, random, true).points;
		for (let i = s === 0 ? 0 : 1; i < side.length; i++) pts.push({
			x: side[i].x,
			y: side[i].y,
			width: side[i].width
		});
	}
	return toPath(pts).map((p) => ({
		...p,
		width: width * pressure(p.t)
	}));
}
/** Where marks along a line sit, in ems below the baseline (negative: above). */
const UNDERLINE = .14;
const DOUBLE_GAP = .09;
const STRIKE = -.27;
const HIGHLIGHT = -.3;
/** A mark's strokes round or along one group, in px. */
function markStrokes(group, o, fontSize, random) {
	const width = Math.max(.5, lengthToPx(o.width, fontSize));
	const pad = lengthToPx(o.padding, fontSize);
	const rough = o.roughness;
	const { ink, baseline } = group;
	const over = () => (.03 + .08 * random()) * rough * fontSize;
	const tilt = () => rough * .04 * fontSize * signed(random);
	const along = (y, w, extra = 0, even = false) => {
		let x0 = ink.minX - pad * .4 - over() - extra;
		let x1 = ink.maxX + pad * .4 + over();
		if (group.rtl) [x0, x1] = [x1, x0];
		const dy = tilt();
		return handLine(x0, y - dy / 2, x1, y + dy / 2, w, rough, random, even);
	};
	const padded = {
		minX: ink.minX - pad,
		minY: ink.minY - pad,
		maxX: ink.maxX + pad,
		maxY: ink.maxY + pad
	};
	switch (o.mark) {
		case "underline": return [{
			path: along(baseline + UNDERLINE * fontSize, width),
			from: 0,
			to: 1
		}];
		case "double": {
			const y = baseline + UNDERLINE * fontSize;
			return [{
				path: along(y, width),
				from: 0,
				to: .48
			}, {
				path: along(y + DOUBLE_GAP * fontSize, width, -.1 * fontSize),
				from: .52,
				to: 1
			}];
		}
		case "strike": return [{
			path: along(baseline + STRIKE * fontSize, width),
			from: 0,
			to: 1
		}];
		case "highlight": {
			const band = .5 * fontSize + 2 * lengthToPx(o.width, fontSize);
			return [{
				path: along(baseline + HIGHLIGHT * fontSize, band, 0, true),
				from: 0,
				to: 1
			}];
		}
		case "circle": return [{
			path: handEllipse(padded, width, rough, random),
			from: 0,
			to: 1
		}];
		case "box": return [{
			path: handBox(padded, width, rough, random, fontSize),
			from: 0,
			to: 1
		}];
		case "cross": {
			const j = () => rough * .05 * fontSize * signed(random);
			return [{
				path: handLine(padded.minX + j(), padded.minY + j(), padded.maxX + j(), padded.maxY + j(), width, rough, random),
				from: 0,
				to: .46
			}, {
				path: handLine(padded.maxX + j(), padded.minY + j(), padded.minX + j(), padded.maxY + j(), width, rough, random),
				from: .54,
				to: 1
			}];
		}
	}
}
/**
* Every mark on the text: where its strokes go and when it's drawn, from
* the strokes as they're placed and timed. The shapes come from each
* group's first glyph's seed, so they're the same every frame, and at every
* seed a little different.
*/
function annotations(strokes, o, fontSize) {
	const groups = annotatedGroups(strokes, o, fontSize);
	const starts = annotationStarts(strokes, groups, o);
	return groups.map((g, k) => ({
		start: starts[k],
		duration: o.duration,
		strokes: markStrokes(g, o, fontSize, seededRandom(strokes[g.members[0]].seed, `annotate:${o.mark}:${k}`)),
		under: o.mark === "highlight"
	}));
}
/** How far a mark's stroke is drawn at `time`, 0–1. */
function markProgress(mark, stroke, time) {
	if (time < mark.start) return 0;
	const local = mark.duration > 0 ? (time - mark.start) / mark.duration : 1;
	const span = stroke.to - stroke.from;
	const p = span > 0 ? (local - stroke.from) / span : local >= stroke.from ? 1 : 0;
	return 1 - (1 - Math.max(0, Math.min(1, p))) ** 2;
}
function paintMarks(ctx, marks, time, color, under) {
	for (const mark of marks) {
		if (mark.under !== under) continue;
		for (const s of mark.strokes) {
			const progress = markProgress(mark, s, time);
			if (progress <= 0) continue;
			paintStroke({
				ctx,
				stroke: {
					path: s.path,
					progress,
					state: progress >= 1 ? "done" : "drawing",
					nibs: []
				},
				style: color,
				lineCap: under ? "butt" : "round"
			});
		}
	}
}
const fmt$1 = (n) => (Math.round(n * 100) / 100).toString();
/**
* Marks the text the way a pen marks a page: underlines it, underlines it
* twice, strikes it out or crosses it through, draws a circle or a box round
* it, or runs a highlighter over it — the whole text, each line or each word,
* or just one of them. The marks are drawn once the text is written, or
* each as soon as what it marks is (the writing waits for it). A `timing`
* hook makes the time for them; the highlighter is an `underlay`, the
* pen's marks an `overlay`, and `svg` draws them into an exported file.
*
* ```ts
* plugins: [annotatePlugin()]                                        // underline the text once it's written
* plugins: [annotatePlugin({ mark: 'circle', target: 'words', pick: 2 })] // circle the second word
* ```
*/
const annotatePlugin = createPlugin({
	name: "annotate",
	label: "Annotate",
	description: "Underlines, circles, boxes, strikes or highlights the text, a word or a line — drawn by hand after the writing, or as it goes. timing + underlay + overlay + svg.",
	params: {
		mark: {
			type: "select",
			label: "Mark",
			default: "underline",
			options: [
				{
					value: "underline",
					label: "Underline"
				},
				{
					value: "double",
					label: "Double underline"
				},
				{
					value: "highlight",
					label: "Highlight"
				},
				{
					value: "strike",
					label: "Strike through"
				},
				{
					value: "circle",
					label: "Circle"
				},
				{
					value: "box",
					label: "Box"
				},
				{
					value: "cross",
					label: "Cross out"
				}
			]
		},
		target: {
			type: "select",
			label: "Marks",
			default: "text",
			options: [
				{
					value: "text",
					label: "The text"
				},
				{
					value: "lines",
					label: "Each line"
				},
				{
					value: "words",
					label: "Each word"
				}
			]
		},
		pick: {
			type: "number",
			label: "Which",
			description: "0 marks every one; 1 just the first, 2 the second…",
			default: 0,
			min: 0,
			max: 40,
			step: 1
		},
		when: {
			type: "select",
			label: "When",
			default: "after",
			options: [{
				value: "after",
				label: "After the writing"
			}, {
				value: "each",
				label: "As each is written"
			}]
		},
		color: {
			type: "color",
			label: "Color",
			default: "#e5484d"
		},
		width: {
			type: "length",
			label: "Width",
			description: "The pen's width: in em, or px as '3px'.",
			default: .045,
			min: .01,
			max: .15,
			step: .005
		},
		padding: {
			type: "length",
			label: "Padding",
			description: "How far off the ink: in em, or px as '10px'.",
			default: .12,
			min: 0,
			max: .6,
			step: .01
		},
		roughness: {
			type: "number",
			label: "Roughness",
			description: "How loosely the hand draws.",
			default: .5,
			min: 0,
			max: 1,
			step: .05
		},
		duration: {
			type: "number",
			label: "Duration",
			description: "Seconds each mark takes.",
			default: .5,
			min: .05,
			max: 3,
			step: .05
		},
		delay: {
			type: "number",
			label: "Delay",
			description: "Seconds before each mark.",
			default: .25,
			min: 0,
			max: 3,
			step: .05
		}
	},
	presets: {
		Highlighter: {
			mark: "highlight",
			target: "lines",
			color: "#ffd400"
		},
		"Circle a word": {
			mark: "circle",
			target: "words",
			pick: 1
		},
		"Words, as written": {
			mark: "underline",
			target: "words",
			when: "each",
			duration: .3,
			delay: .1
		},
		"Cross out": {
			mark: "cross",
			color: "#e5484d",
			roughness: .7
		}
	},
	setup: (options) => {
		let memo = null;
		const marksFor = (strokes, fontSize) => {
			const last = strokes[strokes.length - 1];
			const key = `${strokes.length}|${last?.start}|${last?.duration}|${strokes[0]?.start}`;
			if (memo && memo.path === strokes[0]?.path && memo.key === key && memo.fontSize === fontSize) return memo.marks;
			const marks = strokes.length > 0 ? annotations(strokes, options, fontSize) : [];
			memo = {
				path: strokes[0]?.path,
				key,
				fontSize,
				marks
			};
			return marks;
		};
		return {
			timing({ strokes, duration, fontSize }) {
				const groups = annotatedGroups(strokes, options, fontSize);
				if (groups.length === 0) return void 0;
				return annotateTiming(strokes, groups, duration, options);
			},
			bounds: ({ strokes, fontSize }) => {
				return unionBoxes(marksFor(strokes, fontSize).flatMap((m) => m.strokes.map((s) => s.path.bounds())));
			},
			underlay({ ctx, frame, fontSize }) {
				if (options.mark !== "highlight") return;
				ctx.globalAlpha = HIGHLIGHT_ALPHA;
				ctx.globalCompositeOperation = "multiply";
				paintMarks(ctx, marksFor(frame.strokes, fontSize), frame.time, options.color, true);
			},
			overlay({ ctx, frame, fontSize }) {
				if (options.mark === "highlight") return;
				paintMarks(ctx, marksFor(frame.strokes, fontSize), frame.time, options.color, false);
			},
			svg({ strokes, fontSize, mode, underlay, overlay, appear, seconds }) {
				const marks = marksFor(strokes, fontSize);
				const under = options.mark === "highlight";
				const out = [];
				for (const mark of marks) for (const s of mark.strokes) {
					const pts = s.path.points;
					if (pts.length < 2) continue;
					const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${fmt$1(p.x)} ${fmt$1(p.y)}`).join(" ");
					const w = pts.reduce((sum, p) => sum + p.width, 0) / pts.length;
					const start = mark.start + mark.duration * s.from;
					const length = mark.duration * (s.to - s.from);
					const line = `d="${d}" fill="none" stroke="${options.color}" stroke-width="${fmt$1(w)}" stroke-linecap="${under ? "butt" : "round"}" stroke-linejoin="round"`;
					if (mode === "once") out.push(`<path ${line} pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1" opacity="0"><set attributeName="opacity" to="1" begin="${fmt$1(seconds(start))}s" /><animate attributeName="stroke-dashoffset" values="1;0" begin="${fmt$1(seconds(start))}s" dur="${fmt$1(Math.max(.01, seconds(start + length) - seconds(start)))}s" fill="freeze" /></path>`);
					else {
						const shown = appear(start);
						out.push(`<g${shown.attrs}><path ${line} />${shown.inner}</g>`);
					}
				}
				if (out.length === 0) return;
				if (under) underlay(`<g opacity="${HIGHLIGHT_ALPHA}" style="mix-blend-mode: multiply">${out.join("")}</g>`);
				else overlay(`<g>${out.join("")}</g>`);
			}
		};
	}
});
//#endregion
//#region src/plugins/gradient.ts
function parseColor(color) {
	const h = color.replace("#", "");
	if (h.length === 3) return [
		parseInt(h[0] + h[0], 16),
		parseInt(h[1] + h[1], 16),
		parseInt(h[2] + h[2], 16),
		1
	];
	if (h.length === 4) return [
		parseInt(h[0] + h[0], 16),
		parseInt(h[1] + h[1], 16),
		parseInt(h[2] + h[2], 16),
		parseInt(h[3] + h[3], 16) / 255
	];
	if (h.length === 8) return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16),
		parseInt(h.slice(6, 8), 16) / 255
	];
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16),
		1
	];
}
function lerpColor(a, b, t) {
	const r = Math.round(a[0] + (b[0] - a[0]) * t);
	const g = Math.round(a[1] + (b[1] - a[1]) * t);
	const bl = Math.round(a[2] + (b[2] - a[2]) * t);
	const al = a[3] + (b[3] - a[3]) * t;
	if (al >= 1) return `rgb(${r},${g},${bl})`;
	return `rgba(${r},${g},${bl},${al.toFixed(3)})`;
}
/** The color at draw progress `t` along a stroke of a glyph drawn with `seed` — each glyph starts the run in its own place. */
function strokeGradientAt(o, seed) {
	const { colors } = o;
	if (colors.length === 0) return (t) => `hsl(${(t * 360 + seed * 137.5) % 360}, ${o.saturation}%, ${o.lightness}%)`;
	if (colors.length === 1) return () => colors[0];
	const stops = colors.map(parseColor);
	return (progress) => {
		const scaled = ((progress + seed * .1) % 1 + 1) % 1 * (stops.length - 1);
		const i = Math.min(Math.floor(scaled), stops.length - 2);
		return lerpColor(stops[i], stops[i + 1], scaled - i);
	};
}
/**
* Each stroke colored along its length: a rainbow, or a run through
* `colors`, each glyph starting it somewhere else (its seed).
*
* ```ts
* plugins: [strokeGradientPlugin()]                                // a rainbow
* plugins: [strokeGradientPlugin({ colors: ['#f06', '#fc0'] })]
* ```
*/
const strokeGradientPlugin = paintsDrawnOnly(createPlugin({
	name: "strokeGradient",
	label: "Stroke gradient",
	description: "Each stroke colored along its length: a rainbow, or a run through your colors. paint + svg.",
	params: {
		colors: {
			type: "colors",
			label: "Colors",
			description: "Hex colors to run through; none for a rainbow.",
			default: []
		},
		saturation: {
			type: "number",
			label: "Saturation",
			description: "The rainbow's saturation, %.",
			default: 80,
			min: 0,
			max: 100,
			step: 1
		},
		lightness: {
			type: "number",
			label: "Lightness",
			description: "The rainbow's lightness, %.",
			default: 55,
			min: 0,
			max: 100,
			step: 1
		}
	},
	setup: (options) => {
		const bySeed = /* @__PURE__ */ new Map();
		const colorAt = (seed) => {
			let at = bySeed.get(seed);
			if (!at) {
				if (bySeed.size > 4096) bySeed.clear();
				bySeed.set(seed, at = strokeGradientAt(options, seed));
			}
			return at;
		};
		return {
			paint: (p, next) => next({
				...p,
				style: colorAt(p.stroke.seed)
			}),
			svg(svg) {
				for (const stroke of svg.strokes) svg.style(stroke, { color: colorAt(stroke.seed) });
			}
		};
	}
}));
/**
* The line and color stops of a linear gradient over `box`: endpoints that
* cover the whole box at any angle. y grows downward, so `angle` 0 runs
* left→right and 90 top→bottom — positive angles turn clockwise.
*/
function globalGradientGeometry(box, colors, angle) {
	const rad = angle * Math.PI / 180;
	const dx = Math.cos(rad);
	const dy = Math.sin(rad);
	const width = box.maxX - box.minX;
	const height = box.maxY - box.minY;
	const cx = box.minX + width / 2;
	const cy = box.minY + height / 2;
	const proj = Math.abs(dx * width / 2) + Math.abs(dy * height / 2);
	const stops = colors.length === 1 ? [[0, colors[0]], [1, colors[0]]] : colors.map((c, i) => [i / (colors.length - 1), c]);
	return {
		x1: cx - dx * proj,
		y1: cy - dy * proj,
		x2: cx + dx * proj,
		y2: cy + dy * proj,
		stops
	};
}
/**
* One linear gradient across the whole text, as CSS `background-clip: text`
* would paint it: the first color at one edge of the text, the last at the
* other, whatever strokes it falls on.
*
* ```ts
* plugins: [globalGradientPlugin({ colors: ['#f06', '#40f'], angle: 90 })]
* ```
*/
const globalGradientPlugin = paintsDrawnOnly(createPlugin({
	name: "globalGradient",
	label: "Text gradient",
	description: "One linear gradient across the whole text. paint + svg.",
	params: {
		colors: {
			type: "colors",
			label: "Colors",
			description: "The color stops, in order.",
			default: ["#ff0000", "#0000ff"]
		},
		angle: {
			type: "number",
			label: "Angle",
			description: "Direction in degrees: 0 left to right, 90 top to bottom.",
			default: 0,
			min: -360,
			max: 360,
			step: 1
		}
	},
	setup: ({ colors, angle }) => {
		let cached = null;
		return {
			paint(p, next) {
				if (colors.length === 0) return next(p);
				if (cached?.ctx !== p.ctx || cached.box !== p.textBox) {
					const g = globalGradientGeometry(p.textBox, colors, angle);
					const gradient = p.ctx.createLinearGradient(g.x1, g.y1, g.x2, g.y2);
					for (const [offset, color] of g.stops) gradient.addColorStop(offset, color);
					cached = {
						ctx: p.ctx,
						box: p.textBox,
						gradient
					};
				}
				next({
					...p,
					style: cached.gradient
				});
			},
			svg(svg) {
				if (colors.length === 0) return;
				const g = globalGradientGeometry(svg.textBox, colors, angle);
				const id = svg.id("tk-gg");
				svg.defs(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(g.x1)}" y1="${fmt(g.y1)}" x2="${fmt(g.x2)}" y2="${fmt(g.y2)}">` + g.stops.map(([o, c]) => `<stop offset="${Math.round(o * 1e4) / 1e4}" stop-color="${c}" />`).join("") + "</linearGradient>");
				for (const stroke of svg.strokes) svg.style(stroke, { color: `url(#${id})` });
			}
		};
	}
}));
function fmt(n) {
	return (Math.round(n * 100) / 100).toString();
}
//#endregion
//#region src/plugins/taper.ts
/** The ink's width factor (0–1) at draw progress `t` along a stroke. */
function taperAt(o, t) {
	let m = 1;
	if (o.startLength > 0 && t < o.startLength) m = Math.min(m, t / o.startLength);
	if (o.endLength > 0 && t > 1 - o.endLength) m = Math.min(m, (1 - t) / o.endLength);
	return m;
}
/**
* Strokes that thin to a point toward their ends, the way a brush lifts off
* the page. A dot takes the width of a stroke's middle.
*
* ```ts
* plugins: [taperPlugin({ startLength: 0.1, endLength: 0.3 })]
* ```
*/
const taperPlugin = createPlugin({
	name: "taper",
	label: "Taper",
	description: "Strokes thinning toward their ends. geometry.",
	params: {
		startLength: {
			type: "number",
			label: "Start",
			description: "Share of the stroke that thins toward its start.",
			default: .15,
			min: 0,
			max: 1,
			step: .01
		},
		endLength: {
			type: "number",
			label: "End",
			description: "Share of the stroke that thins toward its end.",
			default: .15,
			min: 0,
			max: 1,
			step: .01
		}
	},
	setup: (options) => ({ geometry(path) {
		if (path.points.length === 1) {
			const m = taperAt(options, .5);
			return path.map((p) => ({
				...p,
				width: p.width * m
			}));
		}
		return path.map((p) => ({
			...p,
			width: p.width * taperAt(options, p.t)
		}));
	} })
});
//#endregion
//#region src/types.ts
/**
* Current bundle format version: 1 since tegaki 1.0, which fixed the format.
* Incremented only when the format changes in a way that older engines cannot
* consume; new optional fields don't change it.
*/
const BUNDLE_VERSION = 1;
/**
* Set of bundle versions that this engine can consume. The engine logs a
* console warning (once per bundle) when it encounters a version outside
* this set. Version 0, the pre-1.0 bundles, is the same format, so it's read
* as it is.
*/
const COMPATIBLE_BUNDLE_VERSIONS = /* @__PURE__ */ new Set([0, 1]);
//#endregion
//#region src/core/bundle-registry.ts
const bundles = /* @__PURE__ */ new Map();
const warnedBundles = /* @__PURE__ */ new Set();
function checkBundleVersion(bundle) {
	if (warnedBundles.has(bundle)) return;
	if (bundle.version == null || !COMPATIBLE_BUNDLE_VERSIONS.has(bundle.version)) {
		warnedBundles.add(bundle);
		console.warn(`[tegaki] Bundle "${bundle.family}" has version ${bundle.version ?? "undefined"}, but this engine supports versions [${[...COMPATIBLE_BUNDLE_VERSIONS].join(", ")}]. The bundle may not render correctly. Regenerate it with a compatible version of tegaki-generator.`);
	}
}
/** Register a font bundle so it can be referenced by family name. */
function registerBundle(bundle) {
	checkBundleVersion(bundle);
	bundles.set(bundle.family, bundle);
	if (bundle.fullFamily && bundle.fullFamily !== bundle.family) bundles.set(bundle.fullFamily, bundle);
}
/** Look up a registered bundle by family name. */
function getBundle(family) {
	return bundles.get(family);
}
function resolveBundle(font) {
	if (typeof font === "string") {
		const bundle = getBundle(font);
		if (!bundle) throw new Error(`TegakiEngine: no bundle registered for "${font}". Call TegakiEngine.registerBundle() first.`);
		return bundle;
	}
	if (font) checkBundleVersion(font);
	return font;
}
//#endregion
//#region src/lib/font.ts
const fontFaces = /* @__PURE__ */ new Map();
/**
* Ensures the bundle's font face is loaded and available for rendering.
* Resolves immediately if the font is already loaded.
*/
async function ensureFontFace(bundle) {
	await ensureFont(bundle.family, bundle.fontUrl, bundle.features, bundle.extraFontUrls, bundle.extraFontRanges, bundle.weight);
}
function ensureFont(family, url, features, extraFontUrls, extraFontRanges, weight = 400) {
	if (typeof document === "undefined") return Promise.resolve();
	const faces = [{
		url,
		unicodeRange: void 0
	}, ...(extraFontUrls ?? []).map((u, i) => ({
		url: u,
		unicodeRange: extraFontRanges?.[i]
	}))].filter((f) => f.unicodeRange !== "");
	const featureSettings = toCssFeatureSettings(features ?? []);
	const fontWeight = String(weight);
	const same = (cached, unicodeRange) => cached?.settings === featureSettings && cached.unicodeRange === unicodeRange && cached.weight === fontWeight;
	if (faces.every((f) => same(fontFaces.get(f.url), f.unicodeRange) && fontFaces.get(f.url)?.face)) return null;
	const pending = faces.map(({ url: u, unicodeRange }) => {
		const cached = fontFaces.get(u);
		if (same(cached, unicodeRange)) return cached.pending;
		const entry = {
			settings: featureSettings,
			unicodeRange,
			weight: fontWeight,
			pending: Promise.resolve(),
			face: null,
			replaces: cached ? cached.face ?? cached.replaces : null
		};
		entry.pending = new FontFace(family, `url(${u})`, {
			featureSettings,
			weight: fontWeight,
			...unicodeRange ? { unicodeRange } : {}
		}).load().then((loaded) => {
			if (fontFaces.get(u) !== entry) return;
			document.fonts.add(loaded);
			if (entry.replaces) document.fonts.delete(entry.replaces);
			entry.face = loaded;
		});
		fontFaces.set(u, entry);
		return entry.pending;
	});
	return Promise.all(pending).then(() => {});
}
const FONT_MIME = {
	ttf: "font/ttf",
	otf: "font/otf",
	woff: "font/woff",
	woff2: "font/woff2"
};
/** A font file as a `data:` URI, for embedding in a standalone SVG. */
async function fontDataUri(url) {
	if (url.startsWith("data:")) return url;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch font ${url}: ${res.status}`);
	const bytes = new Uint8Array(await res.arrayBuffer());
	const ext = /\.(\w+)(?:[?#]|$)/.exec(url)?.[1]?.toLowerCase() ?? "";
	const header = res.headers.get("content-type");
	const mime = FONT_MIME[ext] ?? (header?.startsWith("font/") ? header : "font/ttf");
	let binary = "";
	for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
	return `data:${mime};base64,${btoa(binary)}`;
}
//#endregion
//#region src/lib/inkBounds.ts
const cache = /* @__PURE__ */ new WeakMap();
/** Ink bounds of `glyph`, or null when it has no points. Cached per glyph object. */
function glyphInkBounds(glyph) {
	let bounds = cache.get(glyph);
	if (bounds !== void 0) return bounds;
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let reach = 0;
	const add = (x, y, halfWidth) => {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
		if (halfWidth > reach) reach = halfWidth;
	};
	for (const stroke of glyph.s) {
		for (const p of stroke.p) add(p[0], p[1], Math.max(p[2] ?? 0, .5) / 2);
		for (const n of stroke.n ?? []) {
			const p = stroke.p[n[0]];
			if (p) add(p[0] + n[1], p[1] + n[2], Math.max(n[3], n[4]) / 2);
		}
	}
	bounds = Number.isFinite(minX) ? {
		minX,
		minY,
		maxX,
		maxY,
		reach
	} : null;
	cache.set(glyph, bounds);
	return bounds;
}
const NO_OVERFLOW = {
	left: 0,
	top: 0,
	right: 0,
	bottom: 0
};
/**
* The overflow of an ink box (CSS px, in the default canvas box's frame:
* 0..width × 0..height) past that box, rounded up to whole pixels so a
* sub-pixel change doesn't restyle the canvas.
*/
function inkOverflow(ink, width, height) {
	if (!(ink.minX <= ink.maxX)) return NO_OVERFLOW;
	return {
		left: Math.ceil(Math.max(0, -ink.minX)),
		top: Math.ceil(Math.max(0, -ink.minY)),
		right: Math.ceil(Math.max(0, ink.maxX - width)),
		bottom: Math.ceil(Math.max(0, ink.maxY - height))
	};
}
//#endregion
//#region src/core/render-elements.ts
const PAD_V_CSS = "max(0.2em, 0.9em - 0.5lh)";
/**
* The sentinel's transitions: each inherited style the engine reads ends one
* (after a millisecond), so a class toggled anywhere above reaches it.
*/
const SENTINEL_TRANSITION = "font-size 0.001s, line-height 0.001s, color 0.001s, letter-spacing 0.001s, font-weight 0.001s";
/**
* The canvas's box: the text box padded by 0.2em horizontally and `PAD_V_CSS`
* vertically, grown per side by `overflow` px where the strokes reach further
* (a stem running past a letter's advance under negative letter-spacing, a
* glow).
*/
function canvasBoxStyle(overflow = NO_OVERFLOW) {
	const { left, top, right, bottom } = overflow;
	const plus = (px) => px ? ` + ${px}px` : "";
	const minus = (px) => px ? ` - ${px}px` : "";
	return {
		top: `calc(-1 * ${PAD_V_CSS}${minus(top)})`,
		right: right ? `calc(-0.2em${minus(right)})` : "-0.2em",
		bottom: `calc(-1 * ${PAD_V_CSS}${minus(bottom)})`,
		left: left ? `calc(-0.2em${minus(left)})` : "-0.2em",
		width: `calc(100% + 0.4em${plus(left + right)})`,
		height: `calc(100% + 2 * ${PAD_V_CSS}${plus(top + bottom)})`
	};
}
function buildRootProps(options) {
	const text = options.text ?? "";
	const font = resolveBundle(options.font);
	const fontFamily = font ? cssFontFamily(font, options.fallbackFont) : void 0;
	const duration = text && font ? computeTimeline(text, font, options.timing).totalDuration : 0;
	const timeObj = typeof options.time === "object" ? options.time : null;
	const rawTime = typeof options.time === "number" ? options.time : timeObj?.mode === "controlled" ? timeObj.unit === "progress" ? timeObj.value * duration : timeObj.value : timeObj?.mode === "uncontrolled" ? timeObj.initialTime ?? 0 : 0;
	const easing = timeObj?.mode === "uncontrolled" ? timeObj.easing : void 0;
	const time = easing && duration > 0 ? easing(rawTime / duration) * duration : rawTime;
	const progress = duration > 0 ? time / duration : 0;
	return {
		"data-tegaki": "root",
		dir: options?.direction ?? "auto",
		style: {
			position: "relative",
			maxWidth: "100%",
			width: "auto",
			height: "auto",
			fontFamily,
			fontSynthesisWeight: "none",
			direction: options.direction ?? void 0,
			[CSS_DURATION]: duration,
			[CSS_TIME]: time,
			[CSS_PROGRESS]: progress
		}
	};
}
function buildChildren(options, h) {
	const text = options.text ?? "";
	const isCss = options.time === "css" || typeof options.time === "object" && options.time?.mode === "css";
	const showOverlay = options.showOverlay;
	return h("span", { style: {
		display: "block",
		position: "relative"
	} }, h("span", {
		"data-tegaki": "sentinel",
		"aria-hidden": "true",
		style: {
			position: "absolute",
			width: 0,
			overflow: "hidden",
			pointerEvents: "none",
			fontSize: "inherit",
			lineHeight: "inherit",
			letterSpacing: "inherit",
			visibility: "hidden",
			transition: isCss ? `${SENTINEL_TRANSITION}, ${CSS_PROGRESS} 0.001s` : SENTINEL_TRANSITION
		}
	}), h("canvas", {
		"data-tegaki": "canvas",
		"aria-hidden": "true",
		style: {
			position: "absolute",
			...canvasBoxStyle(),
			pointerEvents: "none",
			overflow: "visible"
		}
	}, h("span", {
		"data-tegaki": "canvas-fallback",
		style: {
			display: "inline-block",
			padding: `${PAD_V_CSS} 0.2em`
		}
	}, text)), h("span", {
		"data-tegaki": "overlay",
		style: {
			display: "block",
			userSelect: "auto",
			whiteSpace: "pre-wrap",
			overflowWrap: "break-word",
			paddingInlineEnd: 1,
			textRendering: "geometricPrecision",
			color: showOverlay ? "rgba(255, 0, 0, 0.4)" : "transparent"
		}
	}, text));
}
function domCreateElement(tag, props, ...children) {
	const el = document.createElement(tag);
	for (const [key, value] of Object.entries(props)) if (key === "style" && typeof value === "object") {
		for (const [k, v] of Object.entries(value)) if (v !== void 0 && v !== null) {
			if (k.startsWith("--")) el.style.setProperty(k, String(v));
			else el.style[k] = typeof v === "number" && k !== "opacity" && k !== "zIndex" ? `${v}px` : v;
		}
	} else if (key === "aria-hidden") el.setAttribute("aria-hidden", String(value));
	else if (key.startsWith("data-")) el.setAttribute(key, String(value));
	for (const child of children) if (typeof child === "string") el.appendChild(document.createTextNode(child));
	else el.appendChild(child);
	return el;
}
//#endregion
export { timingWith as $, computeLayoutBbox as A, unionBoxes as At, PADDING_H_EM as B, annotations as C, parsePluginSpecs as Ct, parseLength as D, expandBox as Dt, lengthToPx as E, clearance as Et, CSS_DURATION as F, paintsAhead as G, allPluginSteps as H, CSS_PROGRESS as I, reshapeWith as J, paintsDrawnOnly as K, CSS_TIME as L, headlessShapedLayout as M, paintStroke as Mt, lineWords as N, computeTimeline as O, inkEdge as Ot, softBreaks as P, syncAttachments as Q, MIN_LINE_HEIGHT_EM as R, annotatePlugin as S, onPluginRegistered as St, createPlugin as T, StrokePath as Tt, outlineWith as U, registerCssProperties as V, paintWith as W, steppedPlugins as X, shapeSteps as Y, svgDecoration as Z, taperAt as _, defaultStrokeEasing as _t, domCreateElement as a, sampleFrame as at, strokeGradientAt as b, isDeclarative as bt, inkOverflow as c, strokeInstances as ct, fontDataUri as d, coerceToString as dt, placementsToSvg as et, getBundle as f, cssFontFamily as ft, COMPATIBLE_BUNDLE_VERSIONS as g, subdivideStroke as gt, BUNDLE_VERSION as h, lookupGlyphData as ht, canvasBoxStyle as i, retimeTimeline as it, computeTextLayout as j, seededRandom as jt, applyShaperPositions as k, offsetPath as kt, ensureFont as l, strokeProgressAt as lt, resolveBundle as m, graphemes as mt, buildChildren as n, placeStrokes as nt, NO_OVERFLOW as o, sampleStroke as ot, registerBundle as p, drawsFallbackGlyphs as pt, pluginStepsAt as q, buildRootProps as r, rawStrokePath as rt, glyphInkBounds as s, strokeInkBounds as st, SENTINEL_TRANSITION as t, glyphLocalTime as tt, ensureFontFace as u, strokeWindow as ut, taperPlugin as v, PluginResolver as vt, groupStrokes as w, registerPlugin as wt, strokeGradientPlugin as x, namesAny as xt, globalGradientPlugin as y, getPlugin as yt, MIN_PADDING_V_EM as z };

