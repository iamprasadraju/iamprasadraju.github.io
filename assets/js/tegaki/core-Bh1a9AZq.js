import { $ as timingWith, A as computeLayoutBbox, At as unionBoxes, B as PADDING_H_EM, Dt as expandBox, E as lengthToPx, F as CSS_DURATION, G as paintsAhead, H as allPluginSteps, I as CSS_PROGRESS, J as reshapeWith, K as paintsDrawnOnly, L as CSS_TIME, M as headlessShapedLayout, Mt as paintStroke, N as lineWords, O as computeTimeline, P as softBreaks, Q as syncAttachments, R as MIN_LINE_HEIGHT_EM, St as onPluginRegistered, T as createPlugin, U as outlineWith, V as registerCssProperties, W as paintWith, X as steppedPlugins, Y as shapeSteps, Z as svgDecoration, _t as defaultStrokeEasing, a as domCreateElement, at as sampleFrame, c as inkOverflow, ct as strokeInstances, d as fontDataUri, et as placementsToSvg, f as getBundle, ft as cssFontFamily, gt as subdivideStroke, ht as lookupGlyphData, i as canvasBoxStyle, it as retimeTimeline, j as computeTextLayout, jt as seededRandom, k as applyShaperPositions, l as ensureFont, lt as strokeProgressAt, m as resolveBundle, mt as graphemes, n as buildChildren, nt as placeStrokes, o as NO_OVERFLOW, p as registerBundle, pt as drawsFallbackGlyphs, q as pluginStepsAt, r as buildRootProps, s as glyphInkBounds, st as strokeInkBounds, t as SENTINEL_TRANSITION, u as ensureFontFace, ut as strokeWindow, vt as PluginResolver, wt as registerPlugin, xt as namesAny, yt as getPlugin, z as MIN_PADDING_V_EM } from "./render-elements-h_jOHgVR.js";
import { l as strongDirection, n as UNSHAPED_OFF_FEATURES, r as toCssFeatureSettings, s as paragraphDirection, t as LETTER_SPACED_OFF_FEATURES } from "./features-EsyCjxeo.js";
//#region src/core/pressure.ts
/**
* The ink's width from the bundle's pen pressure — the `pressure` option,
* run ahead of every plugin: the stroke's mean width blended toward the width
* the bundle gives each point, by `strength` (0: one width along the whole
* stroke; 1: the bundle's widths). Never thinner than half a font unit.
*/
function pressurePlugin(strength) {
	const s = Math.max(0, Math.min(Number.isFinite(strength) ? strength : 1, 1));
	return {
		name: "pressure",
		geometry(path, g) {
			const min = .5 * g.place.scale;
			if (path.points.length === 1) return path.map((p) => ({
				...p,
				width: Math.max(p.width, min)
			}));
			const pts = g.stroke.stroke.p;
			let sum = 0;
			for (const q of pts) sum += q[2];
			const mean = Math.max(sum / pts.length, .5) * g.place.scale;
			if (s === 0) return path.map((p) => ({
				...p,
				width: mean
			}));
			return path.map((p) => ({
				...p,
				width: Math.max(mean + (p.width - mean) * s, min)
			}));
		}
	};
}
/** The `pressure` option as a strength: finite, within 0–1, `1` when unset. */
function resolvePressure(pressure) {
	return pressure === void 0 || !Number.isFinite(pressure) ? 1 : Math.max(0, Math.min(pressure, 1));
}
//#endregion
//#region src/lib/flattenPath.ts
const PATH_TOKEN = /[MmLlHhVvQqCcZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
/**
* SVG path data (M/L/H/V/Q/C/Z, absolute or relative) flattened into closed
* polygons, one flat `[x0, y0, x1, y1, …]` array per contour, with vertices
* at most `step` apart along each segment (Infinity: line ends only, 8 per
* curve). The closing vertex is dropped when it repeats the first.
*/
function flattenPath(d, step) {
	const tokens = d.match(PATH_TOKEN) ?? [];
	const contours = [];
	let pts = [];
	let cx = 0;
	let cy = 0;
	let sx = 0;
	let sy = 0;
	const pieces = (len, fallback) => Number.isFinite(step) && step > 0 ? Math.max(1, Math.ceil(len / step)) : fallback;
	const close = () => {
		const n = pts.length;
		if (n >= 4 && pts[n - 2] === pts[0] && pts[n - 1] === pts[1]) pts.length = n - 2;
		if (pts.length >= 6) contours.push(pts);
		pts = [];
	};
	const lineTo = (x, y) => {
		const n = pieces(Math.hypot(x - cx, y - cy), 1);
		for (let i = 1; i <= n; i++) pts.push(cx + (x - cx) * i / n, cy + (y - cy) * i / n);
		cx = x;
		cy = y;
	};
	let cmd = "";
	let i = 0;
	const num = () => Number(tokens[i++]);
	while (i < tokens.length) {
		if (/[a-z]/i.test(tokens[i])) cmd = tokens[i++];
		const rel = cmd === cmd.toLowerCase();
		const ox = rel ? cx : 0;
		const oy = rel ? cy : 0;
		switch (cmd.toUpperCase()) {
			case "M":
				close();
				cx = sx = ox + num();
				cy = sy = oy + num();
				pts.push(cx, cy);
				cmd = rel ? "l" : "L";
				break;
			case "L":
				lineTo(ox + num(), oy + num());
				break;
			case "H":
				lineTo(ox + num(), cy);
				break;
			case "V":
				lineTo(cx, oy + num());
				break;
			case "Q": {
				const x1 = ox + num();
				const y1 = oy + num();
				const x = ox + num();
				const y = oy + num();
				const n = pieces(Math.hypot(x1 - cx, y1 - cy) + Math.hypot(x - x1, y - y1), 8);
				for (let k = 1; k <= n; k++) {
					const t = k / n;
					const u = 1 - t;
					pts.push(u * u * cx + 2 * u * t * x1 + t * t * x, u * u * cy + 2 * u * t * y1 + t * t * y);
				}
				cx = x;
				cy = y;
				break;
			}
			case "C": {
				const x1 = ox + num();
				const y1 = oy + num();
				const x2 = ox + num();
				const y2 = oy + num();
				const x = ox + num();
				const y = oy + num();
				const n = pieces(Math.hypot(x1 - cx, y1 - cy) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2), 8);
				for (let k = 1; k <= n; k++) {
					const t = k / n;
					const u = 1 - t;
					const a = u * u * u;
					const b = 3 * u * u * t;
					const c = 3 * u * t * t;
					const e = t * t * t;
					pts.push(a * cx + b * x1 + c * x2 + e * x, a * cy + b * y1 + c * y2 + e * y);
				}
				cx = x;
				cy = y;
				break;
			}
			case "Z":
				close();
				cx = sx;
				cy = sy;
				break;
			default: i++;
		}
	}
	close();
	return contours;
}
//#endregion
//#region src/lib/weights.ts
/** The weight of a bundle's own face (absent = 400). */
function bundleWeight(bundle) {
	return bundle.weight ?? 400;
}
/** Every weight the bundle has a face for, its own first. */
function bundleWeights(bundle) {
	return [bundleWeight(bundle), ...(bundle.faces ?? []).map((f) => f.weight)];
}
/**
* The weight CSS font matching picks among `available` for `desired`
* (CSS Fonts 4, §5.2): from 400–500 it tries heavier up to 500, then lighter,
* then heavier; below 400 lighter first; above 500 heavier first. The engine
* picks the face this way so it draws the strokes of the face the browser
* lays the text out in.
*/
function matchFontWeight(available, desired) {
	if (available.length === 0) return desired;
	const sorted = [...new Set(available)].sort((a, b) => a - b);
	const lighter = (limit) => sorted.filter((w) => w <= limit).at(-1);
	const heavier = (limit) => sorted.find((w) => w >= limit);
	if (desired >= 400 && desired <= 500) return sorted.find((w) => w >= desired && w <= 500) ?? lighter(desired) ?? heavier(desired);
	if (desired < 400) return lighter(desired) ?? heavier(desired);
	return heavier(desired) ?? lighter(desired);
}
/** A computed `font-weight` as a number (`normal` = 400, `bold` = 700). */
function parseFontWeight(value) {
	if (value === "bold" || value === "bolder") return 700;
	if (value === "lighter") return 100;
	const n = Number.parseFloat(value ?? "");
	return Number.isFinite(n) ? n : 400;
}
const faceBundles = /* @__PURE__ */ new WeakMap();
/**
* The bundle as the face CSS picks for `weight`: the bundle itself when that's
* its own face, otherwise a bundle with the face's files and strokes in place
* of its own (and no `faces`). The same object for the same bundle and face,
* so caches keyed on the bundle (the shaper, stroke lists) hold across calls.
*/
function bundleForWeight(bundle, weight) {
	if (!bundle.faces?.length) return bundle;
	const matched = matchFontWeight(bundleWeights(bundle), weight);
	if (matched === bundleWeight(bundle)) return bundle;
	const face = bundle.faces.find((f) => f.weight === matched);
	let byWeight = faceBundles.get(bundle);
	if (!byWeight) faceBundles.set(bundle, byWeight = /* @__PURE__ */ new Map());
	let view = byWeight.get(matched);
	if (!view) {
		const { faces: _faces, ...shared } = bundle;
		view = {
			...shared,
			weight: face.weight,
			fontUrl: face.fontUrl,
			extraFontUrls: face.extraFontUrls,
			extraFontRanges: face.extraFontRanges,
			fullFontUrl: face.fullFontUrl,
			glyphData: face.glyphData,
			glyphDataById: face.glyphDataById
		};
		byWeight.set(matched, view);
	}
	return view;
}
//#endregion
//#region src/lib/textToSvg.ts
/**
* Lay text out left-to-right from the bundle's advance widths — the headless
* analogue of the DOM-measured `computeTextLayout`. Lines break only on `\n`
* (no auto-wrap). Sufficient for the no-shaper Latin/CJK path the CLI targets;
* complex-script GPOS positioning (Arabic cursive joins, Indic conjuncts) needs
* the browser shaper and is not modelled here.
*/
function headlessLayout(text, font, letterSpacingEm = 0) {
	const chars = graphemes(text);
	const upm = font.unitsPerEm;
	const lines = [];
	const charOffsets = new Array(chars.length).fill(0);
	let current = [];
	let penEm = 0;
	let maxRightEm = 0;
	for (let i = 0; i < chars.length; i++) {
		const ch = chars[i];
		if (ch === "\n") {
			charOffsets[i] = 0;
			current.push(i);
			lines.push(current);
			current = [];
			penEm = 0;
			continue;
		}
		if (current.length > 0) penEm += letterSpacingEm;
		charOffsets[i] = penEm;
		const glyph = lookupGlyphData(font, ch);
		const widthEm = glyph?.w != null ? glyph.w / upm : .5;
		penEm += widthEm;
		if (penEm > maxRightEm) maxRightEm = penEm;
		current.push(i);
	}
	if (current.length) lines.push(current);
	return {
		lines,
		charOffsets,
		maxRightEm
	};
}
/**
* The glyphs the font draws for `char` set alone — the outlines to clip an
* unshaped timeline's entry to. It carries no glyph id (the bundle has no
* `glyphDataById`), and is placed one per character as the font draws it
* alone. `null` when the font has no glyph for it (`.notdef`).
*/
function charGlyphs(shaper, char, cache) {
	let glyphs = cache.get(char);
	if (glyphs === void 0) {
		let pen = 0;
		glyphs = [];
		for (const g of shaper.shape(char)) {
			if (g.g === "0" || g.g.endsWith(":0")) {
				glyphs = null;
				break;
			}
			glyphs.push({
				g: g.g,
				dx: pen + g.dx,
				dy: g.dy
			});
			pen += g.ax;
		}
		cache.set(char, glyphs);
	}
	return glyphs;
}
/**
* Render text to a standalone SVG string headlessly — no DOM, no canvas. Reuses
* the same pure timeline + serializer the engine's `toSVG()` does, laying the
* text out itself: from the shaper's glyphs and positions when `shaper` is
* given (ligatures, contextual forms, Arabic joining, Indic conjuncts, bidi
* word order), else from the bundle's advance widths. This is what the
* `tegaki` CLI calls.
*
* Characters the bundle has no strokes for are left out — the engine draws
* them from the fallback font.
*/
function textToSvg(text, bundle, options = {}) {
	const font = options.fontWeight === void 0 ? bundle : bundleForWeight(bundle, options.fontWeight);
	const fontSize = options.fontSize ?? 100;
	const mode = options.mode ?? "loop";
	const color = options.color ?? "#1a1a1a";
	const animated = mode !== "static";
	const loop = mode === "loop";
	const shaper = options.shaper ?? null;
	const upm = font.unitsPerEm;
	const scale = fontSize / upm;
	const emHeightPx = (font.ascender - font.descender) / upm * fontSize;
	const lineHeight = options.lineHeight ?? emHeightPx;
	const padH = PADDING_H_EM * fontSize;
	const padV = Math.max(MIN_PADDING_V_EM * fontSize, (MIN_LINE_HEIGHT_EM * fontSize - lineHeight) / 2);
	const halfLeading = (lineHeight - emHeightPx) / 2;
	const letterSpacingEm = (options.letterSpacing ?? 0) / fontSize;
	const shaped = !!shaper && !!font.glyphDataById;
	const timeline = computeTimeline(text, font, options.timing, shaper, {
		letterSpaced: letterSpacingEm !== 0,
		direction: paragraphDirection(text)
	});
	let lines;
	let charOffsets;
	let lineLefts;
	let widthEm;
	if (shaped) {
		const layout = headlessShapedLayout(text, font, shaper, timeline, letterSpacingEm);
		({lines, charOffsets, lineLefts, widthEm} = layout);
	} else {
		const layout = headlessLayout(text, font, letterSpacingEm);
		({lines, charOffsets} = layout);
		widthEm = layout.maxRightEm;
	}
	const totalChars = charOffsets.length;
	const graphemeToLine = new Int32Array(totalChars).fill(-1);
	for (let li = 0; li < lines.length; li++) for (const charIdx of lines[li]) graphemeToLine[charIdx] = li;
	const pressure = Math.max(0, Math.min(options.pressure ?? (loop ? 0 : 1), 1));
	const resolved = new PluginResolver().resolve(options.plugins, { warn: false });
	if (resolved.missing.length > 0) throw new Error(`textToSvg: no plugin registered as ${resolved.missing.map((n) => `"${n}"`).join(", ")}. Register it with registerPlugin().`);
	const plugins = [pressurePlugin(pressure), ...resolved.plugins];
	const smoothing = options.smoothing === true;
	const varies = pressure > 0 || resolved.plugins.some((p) => p.geometry || p.paint);
	const resolvedSegmentSize = options.segmentSize ?? (varies || smoothing ? 2 : void 0);
	const segmentLengthFU = resolvedSegmentSize != null ? resolvedSegmentSize / scale : Infinity;
	let clip = options.clipText && shaper?.glyphPath ? options.clipText : false;
	const seed = options.seed ?? 0;
	const random = (key) => seededRandom(seed, key);
	const onError = (plugin, hook, error) => {
		throw new Error(`textToSvg: plugin "${plugin.name}" threw in ${hook}: ${error instanceof Error ? error.message : String(error)}`);
	};
	const textBox = {
		minX: padH,
		minY: padV,
		maxX: padH + widthEm * fontSize,
		maxY: padV + lines.length * lineHeight
	};
	const origins = /* @__PURE__ */ new Map();
	timeline.entries.forEach((entry, ei) => {
		if (entry.char === "\n" || !entry.hasGlyph) return;
		const charIdx = entry.graphemeIndex;
		const lineIdx = charIdx < totalChars ? graphemeToLine[charIdx] : -1;
		if (lineIdx < 0) return;
		const lineLeftEm = lineLefts?.[lineIdx];
		const xEm = entry.xOffsetEm !== void 0 && lineLeftEm !== void 0 ? lineLeftEm + entry.xOffsetEm : charOffsets[charIdx] ?? 0;
		origins.set(ei, {
			x: padH + xEm * fontSize,
			glyphY: padV + lineIdx * lineHeight + halfLeading + (entry.yOffsetEm ?? 0) * fontSize
		});
	});
	const subdivided = /* @__PURE__ */ new WeakMap();
	const placedInk = placeStrokes(strokeInstances(timeline, font), {
		reshape: reshapeWith(plugins, {
			fontSize,
			random,
			textBox
		}, onError),
		getSubdivided: (stroke) => {
			let sub = subdivided.get(stroke);
			if (!sub) subdivided.set(stroke, sub = subdivideStroke(stroke, segmentLengthFU, smoothing));
			return sub;
		},
		placeEntry: (ei) => {
			const at = origins.get(ei);
			const entry = timeline.entries[ei];
			return at ? {
				x: at.x,
				y: at.glyphY,
				scale,
				ascender: font.ascender,
				seed: seed + entry.graphemeIndex
			} : null;
		}
	});
	const timed = timingWith(plugins, {
		fontSize,
		random
	}, onError)?.(placedInk, timeline.totalDuration);
	const played = timed ? retimeTimeline(timeline, placedInk, timed.strokes, timed.duration) : timeline;
	const strokes = timed?.strokes ?? placedInk;
	const inks = /* @__PURE__ */ new Map();
	for (const s of strokes) {
		let list = inks.get(s.entryIndex);
		if (!list) inks.set(s.entryIndex, list = []);
		list[s.strokeIndex] = {
			path: s.path,
			nibs: s.nibs
		};
	}
	const reshapeOutline = clip ? outlineWith(plugins, onError) : void 0;
	const placements = [];
	const outlines = [];
	const charGlyphCache = /* @__PURE__ */ new Map();
	played.entries.forEach((entry, ei) => {
		const at = origins.get(ei);
		if (!at) return;
		const charIdx = entry.graphemeIndex;
		const glyph = (entry.glyphId !== void 0 ? font.glyphDataById?.[entry.glyphId] : void 0) ?? lookupGlyphData(font, entry.char);
		if (!glyph) return;
		placements.push({
			glyph,
			ox: at.x,
			oy: at.glyphY,
			scale,
			ascender: font.ascender,
			offset: entry.offset,
			duration: entry.duration,
			strokeDelays: entry.strokeDelays,
			strokeDurations: entry.strokeDurations,
			strokeTimeScale: entry.strokeTimeScale,
			inks: inks.get(ei) ?? [],
			entryIndex: ei
		});
		if (clip && shaper && /\S/u.test(entry.char)) {
			const glyphs = entry.glyphId !== void 0 ? [{
				g: entry.glyphId,
				dx: 0,
				dy: 0
			}] : charGlyphs(shaper, entry.char, charGlyphCache);
			const paths = glyphs?.map((g) => shaper.glyphPath?.(g.g) ?? null);
			if (!glyphs || !paths || paths.includes(null)) clip = false;
			else glyphs.forEach((g, i) => {
				const outline = {
					d: paths[i],
					x: at.x + g.dx * scale,
					y: at.glyphY + (font.ascender - g.dy) * scale,
					scale,
					seed: seed + charIdx
				};
				outlines.push(reshapeOutline ? reshapedOutline(outline, segmentLengthFU, font.ascender, fontSize, textBox, reshapeOutline) : outline);
			});
		}
	});
	const strokeScale = typeof clip === "number" ? clip : 1;
	const width = padH * 2 + widthEm * fontSize;
	const height = padV * 2 + lines.length * lineHeight;
	return placementsToSvg(placements, {
		width,
		height,
		lineCap: font.lineCap,
		color,
		strokeScale,
		animated,
		loop,
		totalDuration: played.totalDuration,
		speed: options.speed,
		strokeEasing: options.timing?.strokeEasing,
		glyphEasing: options.timing?.glyphEasing,
		loopHold: options.loopHold,
		crop: options.crop,
		clipText: clip ? { glyphs: outlines } : void 0,
		decorate: plugins.some((p) => p.svg) ? (clock) => svgDecoration(plugins, strokes, clock, {
			duration: played.totalDuration,
			fontSize,
			color,
			textBox,
			random
		}, onError) : void 0
	});
}
/** A glyph outline reshaped by the plugins' `outline` hooks, as the renderer's clip-to-text mask is: flattened, in absolute px. */
function reshapedOutline(g, segmentLengthFU, ascender, fontSize, textBox, reshape) {
	const place = {
		x: g.x,
		y: g.y - ascender * g.scale,
		scale: g.scale,
		ascender
	};
	const fmt = (n) => (Math.round(n * 100) / 100).toString();
	return {
		d: flattenPath(g.d, segmentLengthFU).map((contour) => {
			const pts = [];
			for (let i = 0; i < contour.length; i += 2) pts.push({
				x: g.x + contour[i] * g.scale,
				y: g.y - contour[i + 1] * g.scale
			});
			return `M ${reshape(pts, {
				place,
				seed: g.seed ?? 0,
				fontSize,
				textBox
			}).map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join(" L ")} Z`;
		}).join(" "),
		x: 0,
		y: 0,
		scale: 1,
		placed: true
	};
}
//#endregion
//#region src/plugins/glyphSpace.ts
/** A length param as ems of `fontSize`, what the glyph fields measure in: `0.02` stays 0.02, `'2px'` at 100px is 0.02. */
function inEms(length, fontSize) {
	return fontSize > 0 ? lengthToPx(length, fontSize) / fontSize : 0;
}
/**
* `field` — a way of moving a glyph's points, in its own font units — as a
* move of points in text-box px, for the glyph at `place`. Strokes (in
* `geometry`) and outline contours (in `outline`) go through the same one,
* so clip-to-text follows the ink.
*/
function inPx(field, place) {
	return (p) => {
		const moved = field({
			x: (p.x - place.x) / place.scale,
			y: (p.y - place.y) / place.scale - place.ascender
		});
		return {
			...p,
			x: place.x + moved.x * place.scale,
			y: place.y + (moved.y + place.ascender) * place.scale
		};
	};
}
//#endregion
//#region src/plugins/boil.ts
/** Waves per axis — a sum of a few reads as a hand, one reads as a ripple. */
const WAVES = 3;
/**
* Drawing `step` of a glyph's boil: a smooth field moving any point of it,
* in its own font units — its strokes and its outline alike. Built from the
* glyph's `seed` and the drawing alone, so each drawing is the same every
* time it comes round. `em` is the font's units per em.
*/
function boilField(seed, step, o, em) {
	const random = seededRandom(seed, `boil:${step}`);
	const frequency = 1.5 + o.detail * 8;
	const waves = () => Array.from({ length: WAVES }, (_, i) => {
		const angle = random() * Math.PI * 2;
		const f = frequency * (.6 + random() * .8) * (1 + i * .5);
		return {
			fx: Math.cos(angle) * f,
			fy: Math.sin(angle) * f,
			phase: random() * Math.PI * 2,
			weight: 1 / (1 + i)
		};
	});
	const wx = waves();
	const wy = waves();
	const norm = 1 / wx.reduce((sum, w) => sum + w.weight, 0);
	const reach = o.amount * em * norm;
	const sum = (ws, u, v) => ws.reduce((acc, w) => acc + w.weight * Math.sin(w.fx * u + w.fy * v + w.phase), 0);
	return ({ x, y }) => {
		const u = x / em;
		const v = y / em;
		return {
			x: x + reach * sum(wx, u, v),
			y: y + reach * sum(wy, u, v)
		};
	};
}
/** A stroke's width along it in drawing `step`: a gentle, slow wander either way. */
function boilWidth(seed, strokeKey, step, width) {
	const random = seededRandom(seed, `boil-width:${strokeKey}:${step}`);
	const base = random() * 2 - 1;
	const phase = random() * Math.PI * 2;
	return (t) => Math.max(.05, 1 + width * (.6 * base + .4 * Math.sin(Math.PI * 2 * t + phase)));
}
/**
* Line boil: the ink redrawn a few slightly different ways, one after
* another, several times a second — the shimmer of hand-drawn animation,
* stop motion and games drawn that way. A handful of drawings are made once
* per layout (`steps`), each glyph moving through its own smooth field, and
* the engine shows them in turn. The clip outline boils with the ink.
*
* It boils while the text is written; `idle: true` keeps it boiling after.
* In controlled time the drawing comes from the time given, so a video
* renders the same every time — keep passing time (in seconds) past the
* end for the boil to go on over a hold. Reduced motion holds the first
* drawing.
*
* ```ts
* plugins: [boilPlugin()]                           // while it writes
* plugins: [boilPlugin({ idle: true, fps: 8 })]     // and after, choppier
* ```
*/
const boilPlugin = createPlugin({
	name: "boil",
	label: "Boil",
	description: "The lines redrawn a few ways in turn, like hand-drawn animation or stop motion. steps + geometry + outline.",
	params: {
		drawings: {
			type: "number",
			label: "Drawings",
			description: "How many drawings the cycle has.",
			default: 3,
			min: 2,
			max: 8,
			step: 1
		},
		fps: {
			type: "number",
			label: "Speed",
			description: "Drawings a second.",
			default: 12,
			min: 2,
			max: 24,
			step: 1
		},
		amount: {
			type: "length",
			label: "Amount",
			description: "How far the line wanders: in em, or px as '1px'.",
			default: .012,
			min: 0,
			max: .05,
			step: .001
		},
		detail: {
			type: "number",
			label: "Detail",
			description: "Slow bends (0) to fine jitter (1).",
			default: .3,
			min: 0,
			max: 1,
			step: .05
		},
		width: {
			type: "number",
			label: "Width",
			description: "Ink width wander, as a share of the stroke's.",
			default: .08,
			min: 0,
			max: .4,
			step: .01
		},
		idle: {
			type: "boolean",
			label: "Keep boiling",
			description: "Go on after the text is written or paused — in uncontrolled and CSS time; controlled time boils as its time moves.",
			default: false
		}
	},
	presets: {
		Cartoon: {
			drawings: 3,
			fps: 8,
			amount: .02,
			detail: .15,
			idle: true
		},
		Nervous: {
			drawings: 4,
			fps: 16,
			amount: .008,
			detail: .8
		},
		Sketchy: {
			amount: .025,
			detail: .5,
			width: .2,
			idle: true
		}
	},
	setup: (options) => {
		const drawings = Math.round(options.drawings);
		const fields = /* @__PURE__ */ new Map();
		const fieldFor = (seed, step, em, fontSize) => {
			const key = `${seed}|${step}|${em}|${fontSize}`;
			let field = fields.get(key);
			if (!field) {
				if (fields.size > 4096) fields.clear();
				fields.set(key, field = boilField(seed, step, {
					amount: inEms(options.amount, fontSize),
					detail: options.detail
				}, em));
			}
			return field;
		};
		return {
			steps: {
				count: drawings,
				fps: options.fps,
				idle: options.idle
			},
			geometry(path, g) {
				const move = inPx(fieldFor(g.seed, g.step, g.fontSize / g.place.scale, g.fontSize), g.place);
				const width = boilWidth(g.seed, String(g.stroke.strokeIndex), g.step, options.width);
				return path.map((p) => ({
					...move(p),
					width: p.width * width(p.t)
				}));
			},
			outline(contour, o) {
				return contour.map(inPx(fieldFor(o.seed, o.step, o.fontSize / o.place.scale, o.fontSize), o.place));
			}
		};
	}
});
//#endregion
//#region src/plugins/glow.ts
/**
* A soft light around the ink: a copy of it in the glow's color, blurred,
* under it. Each stroke glows on its own — one shadow per stroke, never one
* per segment (a shadow costs per draw call). With clip-to-text the clip
* would cut that away, so the glow lights the clipped ink as a whole
* instead, fallback characters with it. Two glows stack: add the plugin twice.
*
* Its sizes are lengths in em, so the glow grows with the text: `radius: 0.1`
* spreads a tenth of the font size. A string sets pixels instead, `'8px'`.
*
* ```ts
* plugins: [glowPlugin({ radius: 0.15, color: '#0cf' })]
* ```
*/
const glowPlugin = paintsDrawnOnly(createPlugin({
	name: "glow",
	label: "Glow",
	description: "A soft light around the ink. paint, or ink with clip-to-text; svg.",
	params: {
		radius: {
			type: "length",
			label: "Radius",
			description: "How far the light spreads: in em (a share of the font size), or px as '8px'.",
			default: .1,
			min: 0,
			max: 1,
			step: .01
		},
		color: {
			type: "color",
			label: "Color",
			description: "The light's color. Unset, the text's.",
			default: ""
		},
		offsetX: {
			type: "length",
			label: "Offset X",
			description: "Moves the light right, in em or px.",
			default: 0,
			min: -1,
			max: 1,
			step: .01
		},
		offsetY: {
			type: "length",
			label: "Offset Y",
			description: "Moves the light down, in em or px.",
			default: 0,
			min: -1,
			max: 1,
			step: .01
		}
	},
	setup: ({ radius, color, offsetX, offsetY }) => {
		const pass = (textColor, fontSize) => ({
			color: color || textColor,
			blur: lengthToPx(radius, fontSize),
			dx: lengthToPx(offsetX, fontSize),
			dy: lengthToPx(offsetY, fontSize)
		});
		const reach = (fontSize) => {
			const g = pass("", fontSize);
			return g.blur + Math.max(Math.abs(g.dx), Math.abs(g.dy));
		};
		const strokeGlow = strokeGlowPainter();
		const inkGlow = inkGlowPainter();
		return {
			bounds: ({ strokes, fontSize }) => expandBox(unionBoxes(strokes.map(strokeInkBounds)), reach(fontSize)),
			paint(s, next) {
				if (!s.clipped && s.stroke.state !== "pending") {
					const g = pass(s.color, s.fontSize);
					if (g.blur > 0) strokeGlow(s, g);
				}
				next(s);
			},
			ink(ink) {
				if (!ink.clipped) return;
				const g = pass(ink.color, ink.fontSize);
				if (g.blur > 0) inkGlow(ink, g);
			},
			svg(svg) {
				const g = pass(svg.color, svg.fontSize);
				if (g.blur <= 0) return;
				const id = svg.id("tk-glow");
				svg.defs(`<filter id="${id}" filterUnits="userSpaceOnUse" ${svg.region}><feFlood flood-color="${g.color}" /><feComposite in2="SourceAlpha" operator="in" result="tint" /><feDropShadow in="tint" dx="${fmt(g.dx)}" dy="${fmt(g.dy)}" stdDeviation="${fmt(g.blur / 2)}" flood-color="${g.color}" result="glow" /><feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>`);
				svg.ink(`filter="url(#${id})"`);
			}
		};
	}
}));
function fmt(n) {
	return (Math.round(n * 100) / 100).toString();
}
/** Each stroke's glow copy: the path at the stroke's mean width, with its nib stamps kept the size they are on the ink. */
function strokeGlowPainter() {
	const copies = /* @__PURE__ */ new WeakMap();
	const copyOf = (s) => {
		const { stroke } = s;
		let copy = copies.get(stroke.path);
		if (copy) return copy;
		if (stroke.path.points.length === 1) copy = {
			path: stroke.path,
			nibs: stroke.nibs
		};
		else {
			let sum = 0;
			for (const q of stroke.stroke.p) sum += q[2];
			const width = Math.max(sum / stroke.stroke.p.length, .5) * stroke.place.scale;
			const nibs = stroke.nibs.map((nib) => {
				const f = stroke.path.pointAt(nib.t).width / width;
				return {
					...nib,
					rx: nib.rx * f,
					ry: nib.ry * f
				};
			});
			copy = {
				path: stroke.path.map((p) => ({
					...p,
					width
				})),
				nibs
			};
		}
		copies.set(stroke.path, copy);
		return copy;
	};
	return (s, g) => {
		const stroke = {
			...s.stroke,
			...copyOf(s)
		};
		s.ctx.save();
		s.ctx.shadowBlur = g.blur;
		s.ctx.shadowColor = g.color;
		s.ctx.shadowOffsetX = g.dx;
		s.ctx.shadowOffsetY = g.dy;
		paintStroke({
			ctx: s.ctx,
			stroke,
			style: g.color,
			lineCap: s.lineCap
		});
		s.ctx.restore();
	};
}
/** Where a canvas shadow draws nothing but its blur: the shape goes this far off the canvas and the shadow is offset back. */
const OFFSTAGE = 1e5;
/**
* The glow of the clipped ink, blurred under it. Only the part of the canvas
* the ink reaches (plus the blur) is worked on, and at reduced resolution —
* a glow is soft, so blurring the ink at a quarter of its size and
* stretching it back looks the same for a fraction of the pixels.
*/
function inkGlowPainter() {
	let source = null;
	let tint = null;
	let blur = null;
	const fit = (c, w, h) => {
		if (c.width < w || c.height < h) {
			c.width = Math.max(c.width, w);
			c.height = Math.max(c.height, h);
		}
	};
	return ({ ctx, bounds }, g) => {
		const ink = ctx.canvas;
		if (!bounds) return;
		const reach = 1.5 * g.blur + Math.max(Math.abs(g.dx), Math.abs(g.dy));
		const m = ctx.getTransform();
		const x0 = Math.max(0, Math.floor(m.a * bounds.minX + m.e - reach));
		const y0 = Math.max(0, Math.floor(m.d * bounds.minY + m.f - reach));
		const x1 = Math.min(ink.width, Math.ceil(m.a * bounds.maxX + m.e + reach));
		const y1 = Math.min(ink.height, Math.ceil(m.d * bounds.maxY + m.f + reach));
		const w = x1 - x0;
		const h = y1 - y0;
		if (w <= 0 || h <= 0) return;
		if (!source) source = document.createElement("canvas");
		if (!tint) tint = document.createElement("canvas");
		if (!blur) blur = document.createElement("canvas");
		fit(source, w, h);
		const sctx = source.getContext("2d");
		sctx.globalCompositeOperation = "copy";
		sctx.drawImage(ink, x0, y0, w, h, 0, 0, w, h);
		const k = Math.max(1, Math.min(4, Math.floor(g.blur / 3)));
		const sw = Math.ceil(w / k);
		const sh = Math.ceil(h / k);
		fit(tint, sw, sh);
		fit(blur, sw, sh);
		const tctx = tint.getContext("2d");
		const bctx = blur.getContext("2d");
		tctx.globalCompositeOperation = "copy";
		tctx.imageSmoothingEnabled = true;
		tctx.drawImage(source, 0, 0, w, h, 0, 0, sw, sh);
		tctx.globalCompositeOperation = "source-in";
		tctx.fillStyle = g.color;
		tctx.fillRect(0, 0, sw, sh);
		bctx.clearRect(0, 0, sw, sh);
		bctx.shadowBlur = g.blur / k;
		bctx.shadowColor = g.color;
		bctx.shadowOffsetX = g.dx / k + OFFSTAGE;
		bctx.shadowOffsetY = g.dy / k;
		bctx.drawImage(tint, 0, 0, sw, sh, -1e5, 0, sw, sh);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalCompositeOperation = "destination-over";
		ctx.drawImage(blur, 0, 0, sw, sh, x0, y0, sw * k, sh * k);
	};
}
//#endregion
//#region src/plugins/variation.ts
/** Where the glyph turns, leans and grows about, in ems from its origin — about the middle of a small letter. */
const PIVOT = {
	x: .25,
	y: -.3
};
/**
* The way one glyph strays from the font: a function moving any point of it,
* in its own font units — its strokes and its outline alike, so clip-to-text
* follows the ink. Built from `seed` alone (the glyph's seed), so the same
* glyph at the same seed strays the same way every time. `em` is the font's
* units per em.
*/
function variationField(seed, o, em) {
	const random = seededRandom(seed, "variation");
	const signed = () => random() * 2 - 1;
	const a = o.amount;
	const scale = 1 + a * o.size * signed();
	const shear = Math.tan(a * o.slant * signed() * Math.PI / 180);
	const turn = a * o.rotation * signed() * Math.PI / 180;
	const cos = Math.cos(turn);
	const sin = Math.sin(turn);
	const shiftX = a * o.drift * signed() * em;
	const shiftY = a * o.drift * signed() * em;
	const bend = a * o.warp * em;
	const wave = () => ({
		fx: (1 + random()) * signed(),
		fy: (1 + random()) * signed(),
		phase: random() * Math.PI * 2
	});
	const wx = wave();
	const wy = wave();
	const px = PIVOT.x * em;
	const py = PIVOT.y * em;
	return ({ x, y }) => {
		const u = x / em;
		const v = y / em;
		const bx = bend * Math.sin(wx.fx * u + wx.fy * v + wx.phase);
		const by = bend * Math.sin(wy.fx * u + wy.fy * v + wy.phase);
		const dx = (x - px) * scale - (y - py) * scale * shear;
		const dy = (y - py) * scale;
		return {
			x: px + dx * cos - dy * sin + shiftX + bx,
			y: py + dx * sin + dy * cos + shiftY + by
		};
	};
}
/** A stroke's width along it: one factor for the stroke, and a gentle swell or pinch toward its middle. */
function variationWidth(seed, strokeKey, o) {
	const random = seededRandom(seed, `variation-width:${strokeKey}`);
	const overall = random() * 2 - 1;
	const swell = random() * 2 - 1;
	const w = o.amount * o.width;
	return (t) => Math.max(.05, 1 + w * (.7 * overall + .5 * swell * Math.sin(Math.PI * t)));
}
/**
* Handwriting that's never quite the same twice: every glyph grows or
* shrinks a little, leans, turns, drifts off its place and bends, and every
* stroke runs a little thinner or thicker — each glyph its own way, while
* keeping its shape. How each glyph strays comes from its seed (the
* renderer's `seed` plus its place in the text), so repeated letters differ
* from each other, the same seed draws the same text every time, and
* `seed: 'random'` draws it anew on every load.
*
* ```ts
* plugins: [variationPlugin()]                 // the defaults
* plugins: [variationPlugin({ amount: 1.6 })]  // looser
* ```
*/
const variationPlugin = createPlugin({
	name: "variation",
	label: "Variation",
	description: "Every glyph a little different — size, lean, turn, place, a bend and the ink width — from its seed. geometry + outline.",
	params: {
		amount: {
			type: "number",
			label: "Amount",
			description: "Scales everything below.",
			default: 1,
			min: 0,
			max: 2,
			step: .05
		},
		size: {
			type: "number",
			label: "Size",
			description: "Growth or shrink, as a share of the glyph's size.",
			default: .05,
			min: 0,
			max: .2,
			step: .01
		},
		slant: {
			type: "number",
			label: "Slant",
			description: "Lean, in degrees either way.",
			default: 4,
			min: 0,
			max: 15,
			step: .5
		},
		rotation: {
			type: "number",
			label: "Rotation",
			description: "Turn, in degrees either way.",
			default: 2,
			min: 0,
			max: 10,
			step: .5
		},
		drift: {
			type: "length",
			label: "Drift",
			description: "Shift off its place: in em, or px as '2px'.",
			default: .02,
			min: 0,
			max: .1,
			step: .005
		},
		warp: {
			type: "length",
			label: "Warp",
			description: "A slow bend through the glyph: in em, or px as '1.5px'.",
			default: .015,
			min: 0,
			max: .08,
			step: .005
		},
		width: {
			type: "number",
			label: "Width",
			description: "Ink width, as a share of the stroke's.",
			default: .12,
			min: 0,
			max: .5,
			step: .01
		}
	},
	presets: {
		Subtle: { amount: .5 },
		Loose: { amount: 1.6 },
		Signature: {
			slant: 8,
			warp: .03,
			size: .08,
			rotation: 3
		}
	},
	setup: (options) => {
		const atSize = (fontSize) => ({
			...options,
			drift: inEms(options.drift, fontSize),
			warp: inEms(options.warp, fontSize)
		});
		const fields = /* @__PURE__ */ new Map();
		const fieldFor = (seed, em, fontSize) => {
			const key = `${seed}|${em}|${fontSize}`;
			let field = fields.get(key);
			if (!field) {
				if (fields.size > 4096) fields.clear();
				fields.set(key, field = variationField(seed, atSize(fontSize), em));
			}
			return field;
		};
		return {
			geometry(path, g) {
				const move = inPx(fieldFor(g.seed, g.fontSize / g.place.scale, g.fontSize), g.place);
				const width = variationWidth(g.seed, String(g.stroke.strokeIndex), atSize(g.fontSize));
				return path.map((p) => ({
					...move(p),
					width: p.width * width(p.t)
				}));
			},
			outline(contour, o) {
				const move = inPx(fieldFor(o.seed, o.fontSize / o.place.scale, o.fontSize), o.place);
				return contour.map(move);
			}
		};
	}
});
//#endregion
//#region src/core/createBundle.ts
/**
* Creates a {@link TegakiBundle} from its constituent parts.
*
* Useful when loading font data from a CDN or other source where the
* pre-built bundle modules aren't available:
*
* ```js
* const glyphData = await fetch('.../glyphData.json').then(r => r.json());
* const bundle = createBundle({
*   family: 'Caveat',
*   fontUrl: '.../caveat.ttf',
*   glyphData,
* });
* ```
*
* Other weights of the font go in `faces`, each with its own font file and
* glyph data; the renderer draws the one the text's `font-weight` picks.
*/
function createBundle({ family, fullFamily, fontUrl, fullFontUrl, glyphData, lineCap = "round", unitsPerEm = 1e3, ascender = 800, descender = -200, weight, faces }) {
	const rules = [];
	for (const face of [{
		weight,
		fontUrl,
		fullFontUrl
	}, ...faces ?? []]) {
		const w = face.weight === void 0 ? "" : ` font-weight: ${face.weight};`;
		rules.push(`@font-face { font-family: '${family}'; src: url(${face.fontUrl});${w} }`);
		if (fullFamily && face.fullFontUrl) rules.push(`@font-face { font-family: '${fullFamily}'; src: url(${face.fullFontUrl});${w} }`);
	}
	return {
		version: 1,
		family,
		fullFamily,
		lineCap,
		fontUrl,
		fullFontUrl,
		fontFaceCSS: rules.join(" "),
		unitsPerEm,
		ascender,
		descender,
		glyphData,
		...weight === void 0 ? {} : { weight },
		...faces?.length ? { faces } : {}
	};
}
//#endregion
//#region src/core/drawGlyph.ts
/**
* Draw a single glyph's strokes onto a canvas context, animated up to `localTime`
* — seconds relative to this glyph's start (0 = glyph begins). The strokes go
* through the same plugins the engine runs, after the same pressure step. A
* `timing` hook retimes the glyph's strokes, in seconds from `localTime` 0.
*/
function drawGlyph(ctx, glyph, pos, localTime, options = {}) {
	const { lineCap = "round", color = "#000", style, pressure = 1, plugins = [], seed = 0, getSubdivided, strokeEasing = defaultStrokeEasing, strokeScale = 1, strokeDelays, strokeTimeScale = 1 } = options;
	const scale = pos.fontSize / pos.unitsPerEm;
	const all = [pressurePlugin(pressure), ...plugins];
	const random = (key) => seededRandom(seed, key);
	const onError = (plugin, hook, error) => console.error(`[tegaki] plugin "${plugin.name}" threw in ${hook}:`, error);
	const entry = {
		char: "",
		graphemeIndex: 0,
		offset: 0,
		duration: glyph.t,
		hasGlyph: true,
		strokeDelays
	};
	const windows = glyph.s.map((_, si) => strokeWindow(glyph, si, {
		strokeDelays,
		strokeTimeScale
	}));
	const instances = glyph.s.map((stroke, si) => ({
		id: `0:${si}`,
		entryIndex: 0,
		entry,
		glyph,
		strokeIndex: si,
		stroke,
		start: windows[si].delay,
		duration: windows[si].duration
	}));
	const textBox = {
		minX: pos.x,
		minY: pos.y,
		maxX: pos.x + glyph.w * scale,
		maxY: pos.y + (pos.ascender - pos.descender) * scale
	};
	const shaped = placeStrokes(instances, {
		placeEntry: () => ({
			x: pos.x,
			y: pos.y,
			scale,
			ascender: pos.ascender,
			seed
		}),
		reshape: reshapeWith(all, {
			fontSize: pos.fontSize,
			random,
			textBox
		}, onError),
		getSubdivided
	});
	const placed = timingWith(all, {
		fontSize: pos.fontSize,
		random
	}, onError)?.(shaped, glyph.t).strokes ?? shaped;
	const widened = /* @__PURE__ */ new WeakMap();
	const paint = paintWith(all, onError, strokeScale === 1 ? paintStroke : (s) => {
		if (s.stroke.state === "pending") return;
		let path = widened.get(s.stroke.path);
		if (!path) widened.set(s.stroke.path, path = s.stroke.path.map((p) => ({
			...p,
			width: p.width * strokeScale
		})));
		paintStroke({
			...s,
			stroke: {
				...s.stroke,
				path
			}
		});
	});
	const strokes = placed.map((stroke) => {
		const sample = strokeProgressAt(localTime, stroke.start, stroke.duration, strokeEasing);
		return {
			...stroke,
			...sample,
			head: sample.state === "pending" ? null : stroke.path.pointAt(sample.progress)
		};
	});
	const frame = {
		time: localTime,
		strokes,
		active: strokes.filter((s) => s.state === "drawing" && s.head !== null)
	};
	for (const stroke of strokes) paint({
		ctx,
		stroke,
		style: style ?? color,
		lineCap,
		color,
		clipped: false,
		fontSize: pos.fontSize,
		textBox,
		frame,
		random
	});
}
//#endregion
//#region src/lib/drawFallbackGlyph.ts
/**
* Draw a fallback glyph (plain text, for a character the bundle has no
* strokes for) in the text's color. `text` may be a run of characters, drawn
* in `direction` from its left edge `x`. The plugins' `ink` hooks see it as
* ink, so a glow over the clipped ink takes it in.
*/
function drawFallbackGlyph(ctx, text, x, baseline, fontSize, fontFamily, color, direction = "ltr", fontWeight = 400) {
	ctx.save();
	ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "left";
	ctx.direction = direction;
	ctx.fillStyle = color;
	ctx.fillText(text, x, baseline);
	ctx.restore();
}
//#endregion
//#region src/lib/fallbackRuns.ts
const WHITESPACE_RE = /\s/u;
/**
* Group the timeline's fallback entries (characters the bundle has no glyph
* for, drawn as plain text) into runs of consecutive ones on the same line.
* Drawing a character alone loses everything its neighbours do to it: Arabic
* letters lose their joining forms, and a word drawn letter by letter doesn't
* line up with the same word the DOM (and the clip mask) shapes whole.
*
* A run ends at whitespace, at an entry with a glyph, at a line break, and
* where the direction switches (bidi may put the two halves apart, as
* `lineWords` does for the mask). Returns each entry's run index (`-1` for an
* entry in none) and the runs.
*/
function fallbackRuns(entries, characters, lineOf) {
	const runOf = new Int32Array(entries.length).fill(-1);
	const runs = [];
	let run = null;
	let runLine = -1;
	let lastGrapheme = -1;
	for (let ei = 0; ei < entries.length; ei++) {
		const entry = entries[ei];
		const line = lineOf(entry.graphemeIndex);
		if (entry.hasGlyph || entry.char === "\n" || WHITESPACE_RE.test(entry.char) || line < 0) {
			run = null;
			continue;
		}
		if (run && line === runLine && entry.graphemeIndex === lastGrapheme) {
			run.entries.push(ei);
			runOf[ei] = runs.length - 1;
			continue;
		}
		const direction = strongDirection(entry.char.codePointAt(0));
		const switches = direction && run?.direction && direction !== run.direction;
		if (!run || line !== runLine || entry.graphemeIndex <= lastGrapheme || switches) {
			run = {
				entries: [],
				text: "",
				direction: null
			};
			runs.push(run);
			runLine = line;
		} else run.text += characters.slice(lastGrapheme + 1, entry.graphemeIndex).join("");
		run.entries.push(ei);
		run.text += characters[entry.graphemeIndex] ?? entry.char;
		run.direction ??= direction;
		runOf[ei] = runs.length - 1;
		lastGrapheme = entry.graphemeIndex;
	}
	return {
		runOf,
		runs
	};
}
//#endregion
//#region src/core/shaper-registry.ts
let factory = null;
const shaperCache = /* @__PURE__ */ new Map();
/** Settled shapers by the same key — `null` for one that failed to build. */
const settledShapers = /* @__PURE__ */ new Map();
/**
* A shaper is built from the bundle's font files and features, so a bundle
* that changes either (a feature toggled off) needs its own.
*/
function shaperKey(bundle) {
	return JSON.stringify([
		bundle.fontUrl,
		bundle.extraFontUrls ?? [],
		bundle.features ?? []
	]);
}
/**
* Register a shaper factory. Shaping is opt-in — without a registered factory,
* the renderer iterates raw graphemes and uses the bundle's char-keyed
* `glyphData` map. Use `tegaki/shaper-harfbuzz` for fonts that need complex
* shaping (ligatures, contextual forms, Arabic/Indic scripts).
*
* Re-registering replaces the previous factory and invalidates the shaper
* cache. Pass `null` to unregister.
*/
function registerShaper(f) {
	factory = f;
	shaperCache.clear();
	settledShapers.clear();
}
/**
* Build (or reuse) a shaper for a bundle. Returns `null` when no factory is
* registered or the factory declined this bundle.
*/
function getShaperForBundle(bundle) {
	if (!factory) return null;
	const key = shaperKey(bundle);
	let entry = shaperCache.get(key);
	if (!entry) {
		const result = factory(bundle);
		if (!result) return null;
		shaperCache.set(key, result);
		result.then((shaper) => settledShapers.set(key, shaper), () => settledShapers.set(key, null));
		entry = result;
	}
	return entry;
}
/**
* The bundle's shaper if it has already been built — `null` when it failed to
* build, `undefined` while it is still building (or was never requested). Lets
* the engine switch to a bundle whose shaper is ready without a frame drawn
* unshaped while it awaits the cached promise.
*/
function settledShaperForBundle(bundle) {
	return settledShapers.get(shaperKey(bundle));
}
//#endregion
//#region src/core/engine.ts
/**
* Parse a percentage string like `"50%"` into a 0–1 fraction. Returns `null`
* for non-percentage strings or unparseable input. Whitespace around the
* value is tolerated; the numeric part is parsed with `Number(...)`, so any
* finite numeric form (including negatives and decimals) is accepted.
*/
function parsePercentage(s) {
	const trimmed = s.trim();
	if (!trimmed.endsWith("%")) return null;
	const num = Number(trimmed.slice(0, -1));
	return Number.isFinite(num) ? num / 100 : null;
}
/**
* Parse a computed CSS `letter-spacing` value into pixels. `getComputedStyle`
* returns either `"normal"` (→ 0) or a resolved pixel length like `"2px"`.
* Returns 0 for anything unparseable.
*/
/**
* Where a timeline entry is drawn, in CSS px within the text box: `x` of its
* pen origin, `y` of its line's top, `glyphY` of the glyph frame's top
* (`drawGlyph`'s origin).
*
* Per-entry shaper offsets win when present (Arabic cursive attachment, mark
* positioning, contextual kerning), anchored to the line's measured left edge
* (`lineLefts`); the per-grapheme `charOffsets` are the fallback for the
* unshaped char-keyed render or a shaped glyph without a matching entry. The
* shaper's y-offset is harfbuzz's GPOS dy (negated, em y-down) — Arabic
* cursive lift and mark placement; zero for scripts without vertical GPOS.
*/
function entryOrigin(entry, layout, lineIdx, fontSize, lineHeight, halfLeading) {
	const y = lineIdx * lineHeight;
	const lineLeftEm = layout.lineLefts?.[lineIdx];
	return {
		x: entry.xOffsetEm !== void 0 && lineLeftEm !== void 0 ? (lineLeftEm + entry.xOffsetEm) * fontSize : (layout.charOffsets[entry.graphemeIndex] ?? 0) * fontSize,
		y,
		glyphY: y + halfLeading + (entry.yOffsetEm ?? 0) * fontSize
	};
}
/** A px coordinate for SVG path data, to a hundredth. */
function fmtPx(n) {
	return (Math.round(n * 100) / 100).toString();
}
function parseLetterSpacing(value) {
	if (!value || value === "normal") return 0;
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}
function resolveTimeControl(prop) {
	if (prop == null) return { mode: "uncontrolled" };
	if (typeof prop === "number") return {
		mode: "controlled",
		value: prop
	};
	if (typeof prop === "string") {
		if (prop === "css") return { mode: "css" };
		const pct = parsePercentage(prop);
		if (pct != null) return {
			mode: "controlled",
			value: pct,
			unit: "progress"
		};
		return { mode: "uncontrolled" };
	}
	return prop;
}
/** Far enough past any canvas edge to leave a clip rectangle's side open (canvas rects take no Infinity). */
const CLIP_REACH = 1e6;
/**
* The number a `seed` option draws with: a finite number as given (anything
* else is `0`), or for `'random'` a fresh whole number — short enough to
* write down and pass back.
*/
function resolveSeed(option) {
	if (option === "random") return Math.floor(Math.random() * 1e6);
	return typeof option === "number" && Number.isFinite(option) ? option : 0;
}
/**
* The seed after the `seed` option is set to `option`, from what it was: the
* same option keeps its number — so `'random'`, set again on every render of
* a component, doesn't pick a new one each time — and a new one resolves.
*/
function nextSeed(option, current) {
	const given = option ?? 0;
	return given === current.option ? current : {
		option: given,
		seed: resolveSeed(given)
	};
}
/** Whether the `reducedMotion` setting skips the animation, given the OS `prefers-reduced-motion` setting. */
function isMotionReduced(setting, prefersReducedMotion) {
	return setting === "always" || setting === "user" && prefersReducedMotion;
}
const warnedFontFailures = /* @__PURE__ */ new Set();
/**
* Warn (once per font URL) that a bundle's font file failed to load. The most
* common cause is Vite's dev pre-bundler relocating the bundle module to
* `node_modules/.vite/deps/`, which breaks its relative `.ttf` URL — the dev
* server then answers with `index.html` and the browser rejects it as a font.
*/
function warnFontLoadFailure(bundle, error, face = {
	family: bundle.family,
	url: bundle.fontUrl
}) {
	if (warnedFontFailures.has(face.url)) return;
	warnedFontFailures.add(face.url);
	const viteHint = face.url.includes("/.vite/deps/") ? " This URL points into Vite's pre-bundle cache: add `optimizeDeps: { exclude: ['tegaki'] }` to your vite.config and restart the dev server." : "";
	console.warn(`[tegaki] Failed to load font "${face.family}" from ${face.url}. Rendering with the fallback font's layout, so spacing may be off.${viteHint} See https://tegaki.ink/guides/bundlers/`, error);
}
var TegakiEngine = class {
	/** Register a font bundle so it can be referenced by family name. */
	static registerBundle = registerBundle;
	/** Look up a registered bundle by family name. */
	static getBundle = getBundle;
	/**
	* Register plugin factories (made with `createPlugin`) so `plugins` can
	* name them — `'glow'`, or `['glow', { radius: 0.15 }]` — where a function
	* can't go: an HTML attribute, an Astro prop, a CLI flag. Renderers already
	* naming one pick it up when it's registered.
	*/
	static registerPlugin = registerPlugin;
	/** Look up a registered plugin factory by name. */
	static getPlugin = getPlugin;
	/**
	* Register a shaper factory. Shaping is opt-in — without a registered
	* factory, the renderer iterates raw graphemes and uses the bundle's
	* char-keyed `glyphData` map. Pass the `harfbuzzShaper` export from
	* `tegaki/shaper-harfbuzz` for fonts that need complex shaping.
	*
	* Re-registering replaces the previous factory and invalidates the cache.
	* Pass `null` to unregister.
	*/
	static registerShaper = registerShaper;
	/**
	* Load everything a bundle needs before its first frame — its font faces and
	* (with a registered shaper) its shaper. An engine handed a preloaded bundle
	* draws it complete right away, rather than first without the font or
	* unshaped. Hosts swapping bundles can await this to keep showing the old
	* one until the new one is ready. Never rejects: a part that fails to load
	* degrades the same way it would when rendering.
	*/
	static async preload(bundle) {
		await Promise.all([ensureFontFace(bundle), getShaperForBundle(bundle)]).catch(() => {});
	}
	_rootEl;
	_contentEl = null;
	_sentinelEl;
	_canvasEl;
	_overlayEl;
	_canvasFallbackEl;
	_maskCanvas = null;
	/** What `_maskCanvas` was last drawn from (see `_render`). */
	_maskKey = null;
	/** A copy of the finished ink, for the plugins' `ink` hooks. */
	/** Ink clip-to-text leaves alone (the paint context's `unclipped`), laid under the clipped ink. */
	_unclippedCanvas = null;
	/**
	* Glyph outlines for the clip mask, by path data — and, when an `outline`
	* hook reshapes them, by glyph seed and place — for the shaper, plugins and
	* subdivision they were built with.
	*/
	_maskPaths = {
		shaper: null,
		plugins: null,
		step: 0,
		paths: /* @__PURE__ */ new Map()
	};
	_text = "";
	/** The bundle as given (`font`), with every weight it has. */
	_bundle = null;
	/** The face of `_bundle` the text's weight picks: what the engine draws, shapes and lays out with. */
	_font = null;
	/** The root's computed `font-weight`. */
	_fontWeight = 400;
	_timeControl = { mode: "uncontrolled" };
	_pressure = 1;
	_timing;
	_quality;
	_showOverlay = false;
	_onComplete;
	_onChangeTimeline;
	_direction;
	_fallbackFont;
	_seed = 0;
	/** The `seed` option as given — `'random'` keeps the number it picked until the option changes. */
	_seedOption = 0;
	/** The timeline as scheduled from the text and `timing` options, before the plugins' `timing` hooks retime it (see `_timeline`). */
	_scheduled = {
		entries: [],
		totalDuration: 0
	};
	/** `_timeline` as the plugins' `timing` hooks made it, memoized for what it's made from. */
	_timedCache = null;
	/** The timeline `onChangeTimeline` last reported. */
	_notifiedTimeline = null;
	_layout = null;
	/** Where the layout last wrapped `text` inside a word — the timeline shapes each side on its own. */
	_softBreaks = null;
	/** How far the canvas box currently extends past its default padding, per side. */
	_canvasOverflow = NO_OVERFLOW;
	_layoutKey = "";
	_fontReady = false;
	_shaper = null;
	_shaperReady = true;
	_shaperEnabled = true;
	_strokeCache = /* @__PURE__ */ new WeakMap();
	_strokeCacheKey = "";
	/** Each timeline's strokes (`strokes`), memoized for the font they were computed from. */
	_strokes = /* @__PURE__ */ new WeakMap();
	/** `_shapedStrokes()`, memoized for what places them (see `_placedStrokes`) — one list per combination of the plugins' drawings. */
	_placed = null;
	/** Each list of shaped strokes at the times the plugins' `timing` gives them (see `_placedStrokes`). */
	_timedPlaced = /* @__PURE__ */ new WeakMap();
	/** The drawing each plugin with `steps` shows now — chosen at the start of every render. */
	_steps = {
		steps: /* @__PURE__ */ new Map(),
		key: ""
	};
	/** Where the clock for plugin steps starts, outside controlled time (`performance.now()` ms). */
	_clockOrigin = typeof performance !== "undefined" ? performance.now() : 0;
	/** The loop that redraws while a plugin's steps cycle on their own (`steps.idle`). */
	_idleRafId = 0;
	/** Whether the canvas is on screen — the idle loop stops while it isn't. */
	_onScreen = true;
	/** The `plugins` option as given. */
	_pluginSpecs = [];
	/** Makes `_plugins` from `_pluginSpecs`, keeping the plugin a named entry made while it's named the same way. */
	_pluginResolver = new PluginResolver();
	/** Stops listening for plugin registrations — set while `plugins` names any. */
	_offRegistry = null;
	/** The `plugins` option's plugins. */
	_plugins = [];
	/** The pressure step followed by the user's plugins, memoized for what they came from. */
	_allPluginsCache = null;
	/** Paths drawn wider by clip-to-text's factor, by the path and factor. */
	_widenedPaths = /* @__PURE__ */ new WeakMap();
	/** `path` with every width times `factor` — how clip-to-text draws the ink it clips. */
	_widened(path, factor) {
		const cached = this._widenedPaths.get(path);
		if (cached?.factor === factor) return cached.path;
		const wide = path.map((p) => ({
			...p,
			width: p.width * factor
		}));
		this._widenedPaths.set(path, {
			factor,
			path: wide
		});
		return wide;
	}
	/** Each placed stroke's ink box (see `strokeInkBounds`), by its path — what the frame's ink covers is their union. */
	_inkBoxes = /* @__PURE__ */ new WeakMap();
	/** What the ink and the plugins' `bounds` cover, memoized for the placed strokes and plugins it was computed from. */
	_pluginBoundsCache = null;
	/** The text box plugins paint against, memoized for the layout it was computed from. */
	_textBoxCache = null;
	/** The frame the plugins last saw: `onFrame`'s `prev`. */
	_prevFrame = null;
	/** Plugin hooks that threw, reported once each rather than every frame. */
	_pluginErrors = /* @__PURE__ */ new Set();
	_underlayCanvas = null;
	_containerWidth = 0;
	_fontSize = 0;
	_lineHeight = 0;
	/** CSS `line-height` is `normal`: `_lineHeight` is the browser's line box, re-measured whenever the font may have changed. */
	_lineHeightNormal = false;
	_currentColor = "";
	_letterSpacing = 0;
	_internalTime = 0;
	_cssTime = 0;
	_playing = true;
	_smoothedBoost = 0;
	_delayRemaining = 0;
	_loopGapRemaining = 0;
	_lastTs = null;
	_rafId = 0;
	/** The plugins attached to this engine (see `TegakiPlugin.attach`). */
	_attached = /* @__PURE__ */ new Map();
	/** A redraw a plugin asked for, waiting for the next frame. */
	_redrawRafId = 0;
	_prevCompleted = false;
	/** The OS `prefers-reduced-motion` setting — honoured only when `_reducedMotion` is `'user'`. */
	_prefersReducedMotion = false;
	_reducedMotion = "never";
	_destroyed = false;
	_resizeObserver;
	_intersectionObserver = null;
	_mql = null;
	/**
	* Returns the props (including style) that should be applied to the container element,
	* plus the inner content tree rendered via a framework `createElement` callback.
	*
	* Each child element receives a `data-tegaki` attribute so the engine can adopt
	* pre-rendered elements later via `new TegakiEngine(container, { adopt: true })`.
	*/
	static renderElements(options, createElement) {
		return {
			rootProps: buildRootProps(options),
			content: buildChildren(options, createElement)
		};
	}
	constructor(container, options) {
		registerCssProperties();
		this._rootEl = container;
		if (options?.adopt) {} else {
			const content = buildChildren(options ?? {}, domCreateElement);
			container.appendChild(content);
			this._contentEl = content;
			const rootProps = buildRootProps(options ?? {});
			for (const [key, value] of Object.entries(rootProps.style)) if (value !== void 0 && value !== null) {
				if (key.startsWith("--")) container.style.setProperty(key, String(value));
				else container.style[key] = typeof value === "number" && key !== "opacity" && key !== "zIndex" ? `${value}px` : value;
			}
			container.dataset.tegaki = "root";
			container.dir = options?.direction ?? "auto";
		}
		this._sentinelEl = container.querySelector("[data-tegaki=\"sentinel\"]");
		this._canvasEl = container.querySelector("[data-tegaki=\"canvas\"]");
		this._canvasFallbackEl = container.querySelector("[data-tegaki=\"canvas-fallback\"]");
		this._overlayEl = container.querySelector("[data-tegaki=\"overlay\"]");
		this._resizeObserver = new ResizeObserver(this._onResize);
		this._resizeObserver.observe(this._rootEl);
		if (typeof IntersectionObserver !== "undefined") {
			this._intersectionObserver = new IntersectionObserver(this._onIntersect);
			this._intersectionObserver.observe(this._canvasEl);
		}
		this._sentinelEl.addEventListener("transitionend", this._onSentinelTransition);
		if (typeof window !== "undefined") {
			this._mql = window.matchMedia("(prefers-reduced-motion: reduce)");
			this._prefersReducedMotion = this._mql.matches;
			if (this._mql.addEventListener) this._mql.addEventListener("change", this._onReducedMotionChange);
			else this._mql.addListener(this._onReducedMotionChange);
		}
		this._measure();
		if (options) this.update(options);
	}
	get currentTime() {
		const tc = this._timeControl;
		if (tc.mode === "css") return this._cssTime;
		if (tc.mode === "controlled") return tc.unit === "progress" ? tc.value * this._timeline.totalDuration : tc.value;
		const totalDur = this._timeline.totalDuration;
		if (tc.easing && totalDur > 0) return tc.easing(this._internalTime / totalDur) * totalDur;
		return this._internalTime;
	}
	get duration() {
		return this._timeline.totalDuration;
	}
	/** The seed the renderer draws with — the `seed` option, or the number it picked for `'random'`. Pass it back as `seed` to draw the same again. */
	get seed() {
		return this._seed;
	}
	/**
	* The engine's current timeline — the same object that drives rendering.
	* Reflects the resolved shaper once the (async) shaper promise has
	* settled; use the `onChangeTimeline` option to be notified of recomputations.
	* Treat the returned object as read-only.
	*/
	get timeline() {
		return this._timeline;
	}
	/**
	* Compute a timeline for arbitrary text against this engine's currently-
	* loaded font, timing config, and resolved shaper. Useful for measuring
	* the duration of hypothetical text without changing what's rendered
	* (e.g. layout planning, fade-in scheduling).
	*
	* Returns an empty timeline when no font is loaded. The result reflects
	* shaper state at call time — call after `onChangeTimeline` has fired
	* once to be sure the shaper has resolved.
	*/
	computeTimeline(text) {
		if (!this._font) return {
			entries: [],
			totalDuration: 0
		};
		return computeTimeline(text, this._font, this._timing, this._shaper, this._shapeOptions());
	}
	/**
	* Every stroke on the timeline, one per stroke of each glyph, in the order
	* the canvas paints them: when it starts and how long it draws. Recomputed
	* with the timeline (see `onChangeTimeline`). Treat as read-only.
	*/
	get strokes() {
		return this._strokesOf(this._timeline);
	}
	/**
	* Every stroke at timeline time `time` (default: the current time): its
	* state and draw progress, its `path` (the ink as the canvas draws it, in
	* CSS px from the top-left of the text box), and for a started stroke the
	* pen at the end of its ink, `path.pointAt(progress)`: position, direction
	* and width, variation and taper included. A pure function of time, so it
	* holds under controlled, uncontrolled and CSS time alike. Paths are the
	* same objects from frame to frame until the layout changes, so work
	* derived from one can be cached against it. Strokes of glyphs the layout
	* hasn't placed yet are left out.
	*/
	frameAt(time = this.currentTime) {
		return sampleFrame(this._placedStrokes(), time, this._timing);
	}
	get isPlaying() {
		return this._playing;
	}
	get isComplete() {
		const totalDur = this._timeline.totalDuration;
		if (totalDur === 0) return false;
		if (this._timeControl.mode === "uncontrolled") return this._internalTime >= totalDur;
		return this.currentTime >= totalDur;
	}
	get element() {
		return this._rootEl;
	}
	/**
	* The backing `<canvas>` strokes are drawn onto. Exposed so export tooling
	* can snapshot the current frame (PNG) or sample it over time (WebM/GIF)
	* without reaching through the DOM. Reflects the latest `_render()`.
	*/
	get canvas() {
		return this._canvasEl;
	}
	/**
	* Serialize the current text to an SVG string that draws what the canvas
	* draws, reusing the engine's measured layout and timeline so glyph
	* positions and timing match exactly: speed, glyph and stroke easing,
	* deferred dots and stagger, the ink as the plugins' `geometry` shapes it
	* (pressure width and nib stamps with it), what their `svg` hooks add (a
	* glow, a gradient), clip-to-text and characters drawn from the fallback font.
	*
	* `animated: true` (default) emits a self-drawing SVG that plays once
	* (SMIL). `animated: false` emits the finished artwork. `loop: true` emits
	* a CSS-keyframe animation that draws, holds, fades, and repeats forever —
	* keyframes also animate in `<img>`-embedded SVGs (e.g. a README hero).
	*
	* Clip-to-text and fallback characters are SVG `<text>` in the bundle's
	* font; pass `fontFaces` to embed it (see {@link exportSVG}, which does).
	*/
	toSVG(opts = {}) {
		const font = this._font;
		const layout = this._layout;
		const fontSize = this._fontSize;
		const canvas = this._canvasEl;
		const width = canvas.offsetWidth;
		const height = canvas.offsetHeight;
		if (!font?.glyphData || !layout || !fontSize) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"></svg>`;
		const lineHeight = this._lineHeight;
		const { padH, padV } = this._canvasPadding(fontSize, lineHeight);
		const halfLeading = (lineHeight - (font.ascender - font.descender) / font.unitsPerEm * fontSize) / 2;
		const scale = fontSize / font.unitsPerEm;
		const characters = graphemes(this._text);
		const color = this._currentColor || "black";
		const { maxSegLenFU } = this._subdivision(scale);
		const clipText = this._quality?.clipText;
		const strokeScale = typeof clipText === "number" ? clipText : 1;
		const graphemeToLine = new Int32Array(characters.length).fill(-1);
		for (let li = 0; li < layout.lines.length; li++) for (const charIdx of layout.lines[li]) graphemeToLine[charIdx] = li;
		const textFont = {
			family: cssFontFamily(font, this._fallbackFont),
			fontSize,
			letterSpacing: this._letterSpacing,
			featureSettings: toCssFeatureSettings(font.features ?? [])
		};
		const plugins = this._allPlugins();
		const drawing = allPluginSteps(plugins, 1)[0];
		const shift = (path) => padH === 0 && padV === 0 ? path : path.map((p) => ({
			...p,
			x: p.x + padH,
			y: p.y + padV
		}));
		const strokes = this._placedStrokes(drawing).map((s) => ({
			...s,
			path: shift(s.path),
			rawPath: shift(s.rawPath),
			place: {
				...s.place,
				x: s.place.x + padH,
				y: s.place.y + padV
			}
		}));
		const inks = /* @__PURE__ */ new Map();
		for (const s of strokes) {
			let list = inks.get(s.entryIndex);
			if (!list) inks.set(s.entryIndex, list = []);
			list[s.strokeIndex] = {
				path: s.path,
				nibs: s.nibs
			};
		}
		const placements = [];
		const fallbackTexts = [];
		const fallbackClips = this._fallbackRunClips(layout, characters, graphemeToLine, fontSize);
		const entries = this._timeline.entries;
		for (let ei = 0; ei < entries.length; ei++) {
			const entry = entries[ei];
			if (entry.char === "\n") continue;
			const charIdx = entry.graphemeIndex;
			const lineIdx = graphemeToLine[charIdx] ?? -1;
			if (lineIdx < 0) continue;
			const { x, y, glyphY } = entryOrigin(entry, layout, lineIdx, fontSize, lineHeight, halfLeading);
			const glyph = (entry.glyphId !== void 0 ? font.glyphDataById?.[entry.glyphId] : void 0) ?? lookupGlyphData(font, entry.char);
			if (glyph && entry.hasGlyph) placements.push({
				glyph,
				ox: padH + x,
				oy: padV + glyphY,
				scale,
				ascender: font.ascender,
				offset: entry.offset,
				duration: entry.duration,
				strokeDelays: entry.strokeDelays,
				strokeDurations: entry.strokeDurations,
				strokeTimeScale: entry.strokeTimeScale,
				inks: inks.get(ei) ?? [],
				entryIndex: ei
			});
			else if (!entry.hasGlyph && /\S/u.test(entry.char)) {
				const clip = fallbackClips.get(ei);
				if (clip === null) continue;
				const left = clip?.x ?? x;
				const baseline = y + halfLeading + font.ascender / font.unitsPerEm * fontSize;
				const boxLeft = clip && clip.left > -1e6 ? clip.left : (layout.charOffsets[charIdx] ?? 0) * fontSize;
				const boxRight = clip && clip.right < CLIP_REACH ? clip.right : boxLeft + (layout.charWidths[charIdx] ?? .5) * fontSize;
				fallbackTexts.push({
					text: clip?.text ?? entry.char,
					x: padH + left,
					y: padV + baseline,
					direction: clip?.direction ?? layout.direction ?? "ltr",
					fill: color,
					at: entry.offset + entry.duration,
					clip: clip ? [clip.left > -1e6 ? padH + clip.left : null, clip.right < CLIP_REACH ? padH + clip.right : null] : void 0,
					box: [
						padH + boxLeft,
						padV + y,
						padH + boxRight,
						padV + y + lineHeight
					]
				});
			}
		}
		let clip;
		const reshape = clipText ? outlineWith(plugins, this._reportPluginError, shapeSteps(drawing).steps) : void 0;
		const outlines = !clipText ? null : reshape ? this._glyphOutlines(graphemeToLine)?.map((g) => ({
			d: this._reshapedContours(g, maxSegLenFU, font.ascender, fontSize, this._textBox(layout, fontSize, lineHeight), reshape).map((c) => `M ${c.map((p) => `${fmtPx(p.x + padH)} ${fmtPx(p.y + padV)}`).join(" L ")} Z`).join(" "),
			x: 0,
			y: 0,
			scale: 1,
			placed: true
		})) : this._glyphOutlines(graphemeToLine, padH, padV);
		if (outlines) clip = { glyphs: outlines };
		else if (clipText) {
			const words = [];
			let clipY = 0;
			for (let li = 0; li < layout.lines.length; li++) {
				const baseline = clipY + halfLeading + font.ascender / font.unitsPerEm * fontSize;
				for (const word of lineWords(layout, characters, li)) words.push({
					text: word.text,
					x: padH + word.leftEm * fontSize,
					y: padV + baseline,
					direction: word.direction
				});
				clipY += lineHeight;
			}
			clip = {
				font: textFont,
				words
			};
		}
		const tc = this._timeControl;
		const speed = opts.speed ?? (tc.mode === "uncontrolled" && "speed" in tc && tc.speed ? tc.speed : 1);
		return placementsToSvg(placements, {
			width,
			height,
			lineCap: font.lineCap,
			color,
			strokeScale,
			animated: opts.animated ?? true,
			loop: opts.loop ?? false,
			totalDuration: this._timeline.totalDuration,
			speed,
			strokeEasing: this._timing?.strokeEasing,
			glyphEasing: this._timing?.glyphEasing,
			loopHold: opts.loopHold,
			crop: opts.crop,
			clipText: clip,
			fallback: fallbackTexts.length > 0 ? {
				font: textFont,
				texts: fallbackTexts
			} : void 0,
			fontFaces: opts.fontFaces,
			decorate: plugins.some((p) => p.svg) ? (clock) => {
				const box = this._textBox(layout, fontSize, lineHeight);
				const textBox = {
					minX: box.minX + padH,
					minY: box.minY + padV,
					maxX: box.maxX + padH,
					maxY: box.maxY + padV
				};
				const random = (key) => seededRandom(this._seed, key);
				const base = {
					duration: this._timeline.totalDuration,
					fontSize,
					color,
					textBox,
					random
				};
				return svgDecoration(plugins, strokes, clock, base, this._reportPluginError);
			} : void 0
		});
	}
	/**
	* {@link toSVG}, with the fonts its text needs embedded as data URIs — the
	* bundle's faces when strokes are clipped to the text or characters fall
	* back to the font, and the bundled full font for those characters — so the
	* file renders the same anywhere. Fonts are fetched from the bundle's URLs.
	*/
	async exportSVG(opts = {}) {
		const font = this._font;
		const faces = [];
		if (font) {
			const fallback = drawsFallbackGlyphs(this._timeline.entries);
			if (this._quality?.clipText && !this._glyphOutlines() || fallback) for (const url of [font.fontUrl, ...font.extraFontUrls ?? []]) faces.push({
				family: font.family,
				url
			});
			if (fallback && font.fullFontUrl && font.fullFamily) faces.push({
				family: font.fullFamily,
				url: font.fullFontUrl
			});
		}
		const fontFaces = await Promise.all(faces.map(async ({ family, url }) => ({
			family,
			src: await fontDataUri(url)
		})));
		return this.toSVG({
			...opts,
			fontFaces
		});
	}
	play() {
		if (this._timeControl.mode !== "uncontrolled") return;
		this._playing = true;
		this._evaluatePlayback();
	}
	pause() {
		if (this._timeControl.mode !== "uncontrolled") return;
		this._playing = false;
		this._evaluatePlayback();
	}
	/**
	* Seek the (uncontrolled) timeline to an absolute time. Accepts seconds
	* (number) or a percentage string like `"50%"`, which is interpreted as
	* a fraction of the timeline's total duration.
	*/
	seek(time) {
		if (this._timeControl.mode !== "uncontrolled") return;
		let resolved;
		if (typeof time === "string") {
			const pct = parsePercentage(time);
			if (pct == null) return;
			resolved = pct * this._timeline.totalDuration;
		} else resolved = time;
		this._internalTime = Math.max(0, Math.min(resolved, this._timeline.totalDuration));
		this._delayRemaining = 0;
		this._loopGapRemaining = 0;
		this._checkCompletion();
		this._notifyTimeChange();
		this._render();
		this._updateCssProperties();
	}
	restart() {
		if (this._timeControl.mode !== "uncontrolled") return;
		this._internalTime = 0;
		this._playing = true;
		this._prevCompleted = false;
		this._delayRemaining = this._timeControl.delay ?? 0;
		this._loopGapRemaining = 0;
		this._notifyTimeChange();
		this._evaluatePlayback();
	}
	update(options) {
		if (this._destroyed) return;
		let dirtyTimeline = false;
		let dirtyLayout = false;
		let dirtyRender = false;
		let dirtyPlayback = false;
		if ("text" in options) {
			const nextText = (options.text ?? "").replace(/\r\n?/g, "\n").normalize("NFC");
			if (nextText !== this._text) {
				this._text = nextText;
				dirtyTimeline = true;
				dirtyLayout = true;
			}
		}
		if ("shaper" in options) {
			const next = options.shaper !== false;
			if (next !== this._shaperEnabled) {
				this._shaperEnabled = next;
				this._loadShaper();
				this._updateOverlayStyle();
				dirtyTimeline = true;
				dirtyLayout = true;
				dirtyPlayback = true;
				dirtyRender = true;
			}
		}
		if ("font" in options) {
			const resolved = resolveBundle(options.font) ?? null;
			if (resolved !== this._bundle) {
				this._bundle = resolved;
				this._loadFont(resolved && bundleForWeight(resolved, this._fontWeight));
				dirtyTimeline = true;
				dirtyLayout = true;
				dirtyPlayback = true;
			}
		}
		if ("time" in options) {
			const newTc = resolveTimeControl(options.time);
			const oldTc = this._timeControl;
			const modeChanged = newTc.mode !== oldTc.mode;
			const controlledValueChanged = newTc.mode === "controlled" && oldTc.mode === "controlled" && (newTc.value !== oldTc.value || newTc.unit !== oldTc.unit);
			const uncontrolledChanged = newTc.mode === "uncontrolled" && oldTc.mode === "uncontrolled" && (newTc.speed !== oldTc.speed || newTc.duration !== oldTc.duration || newTc.playing !== oldTc.playing || newTc.loop !== oldTc.loop || newTc.delay !== oldTc.delay || newTc.loopGap !== oldTc.loopGap || newTc.catchUp !== oldTc.catchUp || newTc.easing !== oldTc.easing);
			if (modeChanged || controlledValueChanged || uncontrolledChanged) {
				this._timeControl = newTc;
				if (newTc.mode === "uncontrolled") {
					this._playing = newTc.playing ?? true;
					const oldDelay = oldTc.mode === "uncontrolled" ? oldTc.delay ?? 0 : 0;
					const newDelay = newTc.delay ?? 0;
					if (modeChanged || oldDelay !== newDelay) {
						this._delayRemaining = newDelay;
						this._loopGapRemaining = 0;
					}
				}
				dirtyPlayback = true;
				dirtyRender = true;
				this._updateSentinelTransition();
			}
		}
		if ("reducedMotion" in options && (options.reducedMotion ?? "never") !== this._reducedMotion) {
			this._reducedMotion = options.reducedMotion ?? "never";
			dirtyPlayback = true;
		}
		if ("pressure" in options && resolvePressure(options.pressure) !== this._pressure) {
			this._pressure = resolvePressure(options.pressure);
			dirtyRender = true;
		}
		if ("timing" in options && options.timing !== this._timing) {
			this._timing = options.timing;
			dirtyTimeline = true;
		}
		if ("quality" in options && options.quality !== this._quality) {
			this._quality = options.quality;
			dirtyRender = true;
		}
		if ("plugins" in options && (options.plugins ?? []) !== this._pluginSpecs && this._setPlugins(options.plugins ?? [])) dirtyRender = true;
		if ("seed" in options) {
			const next = nextSeed(options.seed, {
				option: this._seedOption,
				seed: this._seed
			});
			this._seedOption = next.option;
			if (next.seed !== this._seed) {
				this._seed = next.seed;
				dirtyRender = true;
			}
		}
		if ("fallbackFont" in options && options.fallbackFont !== this._fallbackFont) {
			this._fallbackFont = options.fallbackFont;
			dirtyLayout = true;
			dirtyRender = true;
		}
		if ("direction" in options && options.direction !== this._direction) {
			this._direction = options.direction;
			dirtyTimeline = true;
			dirtyLayout = true;
			dirtyRender = true;
		}
		if ("showOverlay" in options && options.showOverlay !== this._showOverlay) {
			this._showOverlay = options.showOverlay ?? false;
			this._updateOverlayStyle();
			dirtyRender = true;
		}
		if ("onComplete" in options) this._onComplete = options.onComplete;
		if ("onChangeTimeline" in options) this._onChangeTimeline = options.onChangeTimeline;
		if (dirtyTimeline) this._recomputeTimeline();
		if (dirtyRender || dirtyTimeline || dirtyLayout) this._updateDom();
		if (dirtyLayout) this._recomputeLayout();
		if (dirtyPlayback) this._evaluatePlayback();
		if (dirtyRender || dirtyTimeline || dirtyLayout) this._render();
		this._updateIdleLoop();
	}
	destroy() {
		this._destroyed = true;
		this._offRegistry?.();
		this._offRegistry = null;
		syncAttachments(this._attached, [], this._attachContext, this._reportPluginError);
		if (this._redrawRafId) cancelAnimationFrame(this._redrawRafId);
		this._redrawRafId = 0;
		this._stopLoop();
		this._updateIdleLoop();
		this._resizeObserver.disconnect();
		this._intersectionObserver?.disconnect();
		this._sentinelEl.removeEventListener("transitionend", this._onSentinelTransition);
		if (this._mql) {
			if (this._mql.removeEventListener) this._mql.removeEventListener("change", this._onReducedMotionChange);
			else this._mql.removeListener(this._onReducedMotionChange);
		}
		this._contentEl?.remove();
		this._strokeCache = /* @__PURE__ */ new WeakMap();
		this._strokeCacheKey = "";
		this._maskCanvas = null;
		this._maskKey = null;
		this._underlayCanvas = null;
		this._unclippedCanvas = null;
		this._placed = null;
		this._timedCache = null;
		this._allPluginsCache = null;
		this._pluginBoundsCache = null;
		this._textBoxCache = null;
		this._prevFrame = null;
	}
	/** The used line height in px, from computed styles (the root's or the sentinel's — both inherit it). */
	_readLineHeight(styles, fontSize) {
		const parsed = Number.parseFloat(styles.lineHeight);
		this._lineHeightNormal = Number.isNaN(parsed);
		return this._lineHeightNormal ? this._measureNormalLineHeight(fontSize) : parsed;
	}
	/**
	* The browser's line box for `line-height: normal`. It comes from font
	* metrics the bundle doesn't carry — the line gap (Nanum Pen Script's is a
	* quarter em) and the platform's choice of ascent/descent tables — so it is
	* measured rather than derived: a probe holding only an empty inline-block
	* gets exactly one line box, the height of the font's strut.
	*/
	_measureNormalLineHeight(fontSize) {
		if (typeof document !== "undefined") {
			const probe = document.createElement("span");
			probe.setAttribute("aria-hidden", "true");
			probe.style.cssText = "position:absolute;top:0;left:0;width:100px;visibility:hidden;pointer-events:none;";
			const strut = document.createElement("span");
			strut.style.display = "inline-block";
			probe.appendChild(strut);
			this._rootEl.appendChild(probe);
			const rect = probe.getBoundingClientRect();
			const scale = probe.offsetWidth > 0 ? rect.width / probe.offsetWidth : 1;
			probe.remove();
			if (rect.height > 0 && scale > 0) return rect.height / scale;
		}
		if (this._font) return (this._font.ascender - this._font.descender) / this._font.unitsPerEm * fontSize;
		return fontSize * 1.2;
	}
	_measure() {
		const styles = getComputedStyle(this._rootEl);
		this._containerWidth = this._rootEl.getBoundingClientRect().width;
		this._fontSize = Number.parseFloat(styles.fontSize);
		this._lineHeight = this._readLineHeight(styles, this._fontSize);
		this._currentColor = styles.color;
		this._letterSpacing = parseLetterSpacing(styles.letterSpacing);
		this._fontWeight = parseFontWeight(styles.fontWeight);
		this._updateOverlayStyle();
	}
	/**
	* Adopt the text's computed `font-weight`. A bundle with several weights
	* draws the face CSS font matching picks for it (the one the browser lays
	* the text out in), so a new face is loaded and the text shaped in it again.
	* Returns whether the weight changed; the caller lays the text out again.
	*/
	_setFontWeight(next) {
		if (next === this._fontWeight) return false;
		this._fontWeight = next;
		const face = this._bundle && bundleForWeight(this._bundle, next);
		if (face !== this._font) {
			this._loadFont(face);
			this._recomputeTimeline();
			this._updateDom();
			this._evaluatePlayback();
		}
		return true;
	}
	/** How the overlay's text is laid out, for the shaper to match. */
	/**
	* How the timeline shapes the text. The layout's shaping must agree (it
	* matches glyph ids against the timeline's), so it takes the DOM's resolved
	* direction — the same one: the root is `dir="auto"` unless told otherwise.
	*/
	_shapeOptions() {
		return {
			letterSpaced: this._letterSpacing !== 0,
			direction: this._direction ?? paragraphDirection(this._text)
		};
	}
	/**
	* Adopt a new letter spacing. Browsers shape spaced text without ligatures
	* or contextual alternates, so when spacing crosses zero the overlay's
	* feature settings and the shaped timeline change with it. Callers
	* recompute the layout afterwards, which re-fills the timeline's offsets.
	*/
	_setLetterSpacing(next) {
		const wasSpaced = this._letterSpacing !== 0;
		this._letterSpacing = next;
		if (wasSpaced === (next !== 0)) return;
		this._updateOverlayStyle();
		this._recomputeTimeline();
	}
	_updateDom() {
		this._rootEl.style.fontFamily = this._font ? cssFontFamily(this._font, this._fallbackFont) : "";
		this._rootEl.style.direction = this._direction ?? "";
		this._updateCssProperties();
		if (this._overlayEl.textContent !== this._text) this._overlayEl.textContent = this._text;
		this._canvasFallbackEl.textContent = this._text;
	}
	_updateCssProperties() {
		const time = this.currentTime;
		const dur = this._timeline.totalDuration;
		this._rootEl.style.setProperty(CSS_DURATION, String(dur));
		this._rootEl.style.setProperty(CSS_TIME, String(time));
		this._rootEl.style.setProperty(CSS_PROGRESS, String(dur > 0 ? time / dur : 0));
	}
	_updateOverlayStyle() {
		this._overlayEl.style.color = this._showOverlay ? "rgba(255, 0, 0, 0.4)" : "transparent";
		this._overlayEl.style.fontFeatureSettings = !this._shaperEnabled ? UNSHAPED_OFF_FEATURES.map((tag) => `'${tag}' 0`).join(", ") : this._letterSpacing !== 0 ? LETTER_SPACED_OFF_FEATURES.map((tag) => `'${tag}' 0`).join(", ") : "";
	}
	_updateSentinelTransition() {
		const isCss = this._timeControl.mode === "css";
		this._sentinelEl.style.transition = isCss ? `${SENTINEL_TRANSITION}, ${CSS_PROGRESS} 0.001s` : SENTINEL_TRANSITION;
	}
	_onResize = (entries) => {
		const entry = entries[0];
		if (!entry) return;
		const newWidth = entry.contentRect.width;
		const styles = getComputedStyle(this._rootEl);
		const newFontSize = Number.parseFloat(styles.fontSize);
		const newLineHeight = this._readLineHeight(styles, newFontSize);
		const newColor = styles.color;
		const newLetterSpacing = parseLetterSpacing(styles.letterSpacing);
		let changed = false;
		let layoutChanged = false;
		if (this._setFontWeight(parseFontWeight(styles.fontWeight))) {
			layoutChanged = true;
			changed = true;
		}
		if (newWidth !== this._containerWidth) {
			this._containerWidth = newWidth;
			layoutChanged = true;
			changed = true;
		}
		if (newFontSize !== this._fontSize) {
			this._fontSize = newFontSize;
			layoutChanged = true;
			changed = true;
		}
		if (newLineHeight !== this._lineHeight) {
			this._lineHeight = newLineHeight;
			layoutChanged = true;
			changed = true;
		}
		if (newColor !== this._currentColor) {
			this._currentColor = newColor;
			changed = true;
		}
		if (newLetterSpacing !== this._letterSpacing) {
			this._setLetterSpacing(newLetterSpacing);
			layoutChanged = true;
			changed = true;
		}
		if (layoutChanged) this._recomputeLayout();
		if (changed) this._render();
	};
	_onSentinelTransition = (e) => {
		const styles = getComputedStyle(this._sentinelEl);
		let changed = false;
		if (e.propertyName === "font-size" || e.propertyName === "line-height") {
			const newFontSize = Number.parseFloat(styles.fontSize);
			const newLineHeight = this._readLineHeight(styles, newFontSize);
			if (newFontSize !== this._fontSize || newLineHeight !== this._lineHeight) {
				this._fontSize = newFontSize;
				this._lineHeight = newLineHeight;
				this._recomputeLayout();
				changed = true;
			}
		}
		if (e.propertyName === "font-weight" && this._setFontWeight(parseFontWeight(styles.fontWeight))) {
			this._recomputeLayout();
			changed = true;
		}
		if (e.propertyName === "color") {
			const newColor = styles.color;
			if (newColor !== this._currentColor) {
				this._currentColor = newColor;
				changed = true;
			}
		}
		if (e.propertyName === "letter-spacing") {
			const newLetterSpacing = parseLetterSpacing(styles.letterSpacing);
			if (newLetterSpacing !== this._letterSpacing) {
				this._setLetterSpacing(newLetterSpacing);
				this._recomputeLayout();
				changed = true;
			}
		}
		if (e.propertyName === "--tegaki-progress") {
			const rawProgress = Number(styles.getPropertyValue(CSS_PROGRESS));
			this._cssTime = rawProgress * this._timeline.totalDuration;
			changed = true;
		}
		if (changed) this._render();
	};
	_onReducedMotionChange = (e) => {
		this._prefersReducedMotion = e.matches;
		this._evaluatePlayback();
		this._updateIdleLoop();
		this._render();
	};
	get _motionReduced() {
		return isMotionReduced(this._reducedMotion, this._prefersReducedMotion);
	}
	/**
	* Under reduced motion the text is shown finished: jump to the end (firing
	* `onComplete`) instead of writing it out. Called from every playback
	* evaluation, so it also covers the first timeline, text changes and
	* `restart()`.
	*/
	_skipToEnd() {
		const totalDur = this._timeline.totalDuration;
		if (totalDur === 0 || this._internalTime >= totalDur) return;
		this._internalTime = totalDur;
		this._delayRemaining = 0;
		this._loopGapRemaining = 0;
		this._checkCompletion();
		this._notifyTimeChange();
		this._render();
		this._updateCssProperties();
	}
	_loadFont(font) {
		this._font = font;
		this._fontReady = false;
		if (!font) {
			this._loadShaper();
			return;
		}
		const pending = ensureFont(font.family, font.fontUrl, font.features, font.extraFontUrls, font.extraFontRanges, font.weight);
		if (pending === null) this._fontReady = true;
		else {
			const currentFont = font;
			const onSettled = () => {
				if (this._font === currentFont && !this._destroyed) {
					this._fontReady = true;
					this._recomputeTimeline();
					this._updateDom();
					this._recomputeLayout();
					this._evaluatePlayback();
					this._render();
				}
			};
			pending.then(onSettled, (error) => {
				warnFontLoadFailure(currentFont, error);
				onSettled();
			});
		}
		this._loadShaper();
	}
	/**
	* Resolve the shaper for the current font. Called when the font changes or
	* when the `shaper` option is toggled. Drops any in-flight shaper for the
	* previous font; the `_font === currentFont` guard inside the promise
	* handler discards stale resolutions.
	*/
	_loadShaper() {
		this._shaper = null;
		this._shaperReady = true;
		if (!this._shaperEnabled || !this._font) return;
		const shaperPromise = getShaperForBundle(this._font);
		if (!shaperPromise) return;
		const settled = settledShaperForBundle(this._font);
		if (settled !== void 0) {
			this._shaper = settled;
			return;
		}
		this._shaperReady = false;
		const currentFont = this._font;
		const onSettled = (shaper) => {
			if (this._font === currentFont && this._shaperEnabled && !this._destroyed) {
				this._shaper = shaper;
				this._shaperReady = true;
				this._recomputeTimeline();
				this._recomputeLayout();
				this._evaluatePlayback();
				this._render();
			}
		};
		shaperPromise.then(onSettled, (error) => {
			console.warn(`[tegaki] Shaper failed for "${currentFont.family}"; rendering without shaping.`, error);
			onSettled(null);
		});
	}
	/**
	* Where each fallback character (one the bundle has no glyph for) is drawn
	* from, by timeline entry. Characters are drawn in runs of consecutive ones
	* (`fallbackRuns`): the run's whole text, shaped together as the DOM shapes
	* it — alone, an Arabic letter would lose its joining form — at the run's
	* left edge, clipped to the character's own box so each still appears when
	* its time comes. The run's outer edges aren't clipped: ink reaching past
	* the advance boxes (a swash, a final tail) belongs to the end letters.
	* A character with several entries (a cluster of code points the font
	* lacks) is drawn by its first; the rest map to `null`.
	*/
	_fallbackRunClips(layout, characters, graphemeToLine, fontSize) {
		const clips = /* @__PURE__ */ new Map();
		const entries = this._timeline.entries;
		const { runs } = fallbackRuns(entries, characters, (g) => graphemeToLine[g] ?? -1);
		for (const run of runs) {
			if (run.entries.length < 2) continue;
			const boxes = [];
			let lastGrapheme = -1;
			for (const ei of run.entries) {
				const g = entries[ei].graphemeIndex;
				if (g === lastGrapheme) {
					clips.set(ei, null);
					continue;
				}
				lastGrapheme = g;
				const left = (layout.charOffsets[g] ?? 0) * fontSize;
				boxes.push({
					ei,
					left,
					right: left + (layout.charWidths[g] ?? 0) * fontSize
				});
			}
			const runLeft = Math.min(...boxes.map((b) => b.left));
			const runRight = Math.max(...boxes.map((b) => b.right));
			const direction = run.direction ?? layout.direction ?? "ltr";
			for (const box of boxes) clips.set(box.ei, {
				text: run.text,
				x: runLeft,
				left: box.left === runLeft ? -1e6 : box.left,
				right: box.right === runRight ? CLIP_REACH : box.right,
				direction
			});
		}
		return clips;
	}
	_recomputeTimeline() {
		if (this._font && this._text) {
			const wraps = this._softBreaks?.text === this._text ? this._softBreaks.offsets : void 0;
			this._scheduled = computeTimeline(this._text, this._font, this._timing, this._shaper, this._shapeOptions(), wraps);
		} else this._scheduled = {
			entries: [],
			totalDuration: 0
		};
		if (!this._allPlugins().some((p) => p.timing)) this._timelineChanged();
		this._loadFullFontIfNeeded();
	}
	/** Report the timeline if it changed since last reported (`onChangeTimeline`). */
	_timelineChanged() {
		const timeline = this._timeline;
		if (timeline === this._notifiedTimeline) return;
		this._notifiedTimeline = timeline;
		if (this._prevCompleted && this._timeControl.mode === "uncontrolled" && this._motionReduced) this._internalTime = timeline.totalDuration;
		this._updateCssProperties();
		this._onChangeTimeline?.(timeline);
	}
	/**
	* The timeline everything plays: the scheduled one, retimed by the plugins'
	* `timing` hooks — once the layout has placed the strokes they retime.
	*/
	get _timeline() {
		const scheduled = this._scheduled;
		const plugins = this._allPlugins();
		if (!plugins.some((p) => p.timing)) return scheduled;
		const placed = this._shapedStrokes(allPluginSteps(plugins, 1)[0]);
		if (placed.length === 0) return scheduled;
		const deps = [
			scheduled,
			placed,
			plugins
		];
		const cached = this._timedCache;
		if (cached?.deps.every((d, i) => d === deps[i])) return cached.timeline;
		const random = (key) => seededRandom(this._seed, key);
		const timed = timingWith(plugins, {
			fontSize: this._fontSize,
			random
		}, this._reportPluginError)(placed, scheduled.totalDuration);
		const timeline = retimeTimeline(scheduled, placed, timed.strokes, timed.duration);
		this._timedCache = {
			deps,
			timeline
		};
		return timeline;
	}
	/** A timeline's strokes (see `strokes`). */
	_strokesOf(timeline) {
		const font = this._font;
		if (!font?.glyphData) return [];
		const cached = this._strokes.get(timeline);
		if (cached?.font === font) return cached.list;
		const list = strokeInstances(timeline, font);
		this._strokes.set(timeline, {
			font,
			list
		});
		return list;
	}
	/**
	* Load the bundle's full font once the text draws a character the bundle
	* has no glyph for, and only then: a CJK full font is megabytes, and text
	* that stays within the generated set never needs it. The overlay lays such
	* characters out in the root's font stack and the canvas draws them as
	* plain text in it, so both re-run once the face arrives.
	*/
	_loadFullFontIfNeeded() {
		const font = this._font;
		if (!font?.fullFamily || !font.fullFontUrl || !drawsFallbackGlyphs(this._timeline.entries)) return;
		const face = {
			family: font.fullFamily,
			url: font.fullFontUrl
		};
		const pending = ensureFont(face.family, face.url, font.features, void 0, void 0, font.weight);
		if (pending === null) return;
		pending.then(() => {
			if (this._font !== font || this._destroyed) return;
			this._layoutKey = "";
			this._recomputeLayout();
			this._render();
		}, (error) => warnFontLoadFailure(font, error, face));
	}
	_recomputeLayout() {
		if (this._overlayEl.textContent !== this._text) return;
		if (this._lineHeightNormal) this._lineHeight = this._measureNormalLineHeight(this._fontSize);
		if (this._fontReady && this._font?.family && this._fontSize && this._containerWidth && this._text) {
			const shaperId = this._shaper ? "1" : "0";
			const key = `${this._text}\0${this._font.family}\0${this._fallbackFont ?? ""}\0${this._fontSize}\0${this._lineHeight}\0${this._containerWidth}\0${this._direction ?? ""}\0${shaperId}\0${this._letterSpacing}\0${this._fontWeight}`;
			if (key === this._layoutKey) return;
			this._layoutKey = key;
			let layout = computeTextLayout(this._overlayEl, this._fontSize);
			if (this._shaper && this._font) {
				const breaks = softBreaks(layout, this._text);
				const known = this._softBreaks?.text === this._text ? this._softBreaks.offsets : [];
				if (breaks.join() !== known.join()) {
					this._softBreaks = {
						text: this._text,
						offsets: breaks
					};
					this._recomputeTimeline();
				}
				const letterSpacingEm = this._fontSize > 0 ? this._letterSpacing / this._fontSize : 0;
				layout = applyShaperPositions(layout, this._overlayEl, this._text, this._fontSize, this._font, this._shaper, this._scheduled, letterSpacingEm);
			}
			this._layout = layout;
		} else {
			this._layoutKey = "";
			this._layout = null;
		}
	}
	_evaluatePlayback() {
		const ready = this._timeControl.mode === "uncontrolled" && !!this._font && this._fontReady && this._shaperReady;
		const reduced = this._motionReduced;
		if (ready && reduced) this._skipToEnd();
		if (ready && this._playing && !reduced) this._startLoop();
		else this._stopLoop();
	}
	_startLoop() {
		if (this._rafId) return;
		this._lastTs = null;
		this._smoothedBoost = 0;
		this._rafId = requestAnimationFrame(this._tick);
	}
	_stopLoop() {
		if (this._rafId) {
			cancelAnimationFrame(this._rafId);
			this._rafId = 0;
		}
	}
	_tick = (ts) => {
		if (this._destroyed) return;
		if (this._lastTs === null) this._lastTs = ts;
		const dtSec = (ts - this._lastTs) / 1e3;
		this._lastTs = ts;
		const tc = this._timeControl;
		if (tc.mode !== "uncontrolled") return;
		const loop = tc.loop ?? false;
		const totalDur = this._timeline.totalDuration;
		const durationOverride = tc.duration;
		const useDuration = durationOverride !== void 0 && durationOverride > 0;
		if (totalDur === 0 || !loop && this._internalTime >= totalDur) {
			this._internalTime = totalDur;
			this._rafId = requestAnimationFrame(this._tick);
			return;
		}
		if (this._delayRemaining > 0) {
			this._delayRemaining = Math.max(0, this._delayRemaining - dtSec);
			this._rafId = requestAnimationFrame(this._tick);
			return;
		}
		if (this._loopGapRemaining > 0) {
			this._loopGapRemaining = Math.max(0, this._loopGapRemaining - dtSec);
			if (this._loopGapRemaining <= 0) {
				this._internalTime = 0;
				this._prevCompleted = false;
				this._smoothedBoost = 0;
			}
			this._notifyTimeChange();
			this._render();
			this._updateCssProperties();
			this._rafId = requestAnimationFrame(this._tick);
			return;
		}
		let effectiveSpeed;
		if (useDuration) effectiveSpeed = totalDur / durationOverride;
		else {
			const speed = tc.speed ?? 1;
			const catchUp = tc.catchUp ?? 0;
			effectiveSpeed = speed;
			if (catchUp > 0) {
				const remaining = Math.max(0, totalDur - this._internalTime);
				const targetBoost = catchUp * Math.max(0, remaining - 2);
				const attackRate = 4;
				const releaseRate = loop ? 30 : 2;
				const rate = targetBoost > this._smoothedBoost ? attackRate : releaseRate;
				this._smoothedBoost += (targetBoost - this._smoothedBoost) * (1 - Math.exp(-rate * dtSec));
				effectiveSpeed = speed + this._smoothedBoost;
			}
		}
		let next = this._internalTime + dtSec * effectiveSpeed;
		if (next >= totalDur) {
			if (loop) {
				const loopGap = tc.loopGap ?? 0;
				if (loopGap > 0) {
					next = totalDur;
					this._loopGapRemaining = loopGap;
				} else if (this._internalTime < totalDur) next = totalDur;
				else next %= totalDur;
			} else next = totalDur;
			this._smoothedBoost = 0;
		}
		this._internalTime = next;
		this._notifyTimeChange();
		this._checkCompletion();
		this._render();
		this._updateCssProperties();
		this._rafId = requestAnimationFrame(this._tick);
	};
	_notifyTimeChange() {
		const tc = this._timeControl;
		if (tc.mode === "uncontrolled" && tc.onTimeChange) tc.onTimeChange(this.currentTime);
	}
	_checkCompletion() {
		const complete = this.isComplete;
		if (complete && !this._prevCompleted) {
			this._prevCompleted = true;
			this._onComplete?.();
		} else if (!complete) this._prevCompleted = false;
	}
	/**
	* Where the text box sits in the canvas: the default padding plus whatever
	* the canvas box was grown by on the left / top to fit the ink.
	*/
	_canvasPadding(fontSize, lineHeight) {
		const padV = Math.max(MIN_PADDING_V_EM * fontSize, (MIN_LINE_HEIGHT_EM * fontSize - lineHeight) / 2);
		return {
			padH: PADDING_H_EM * fontSize + this._canvasOverflow.left,
			padV: padV + this._canvasOverflow.top
		};
	}
	/**
	* Grow the canvas box on whichever side the strokes reach past its default
	* padding — a stem running past its letter's advance (Caveat's d under
	* negative letter-spacing), a wide script flourish, a glow — and shrink it
	* back once they don't. Every glyph counts, drawn yet or not, so the box
	* holds still while the text animates in. Restyles only on change.
	*/
	_fitCanvasToInk() {
		const font = this._font;
		const layout = this._layout;
		const fontSize = this._fontSize;
		const cur = this._canvasOverflow;
		let next = NO_OVERFLOW;
		if (font?.glyphData && layout && fontSize) {
			const lineHeight = this._lineHeight;
			const scale = fontSize / font.unitsPerEm;
			const halfLeading = (lineHeight - (font.ascender - font.descender) / font.unitsPerEm * fontSize) / 2;
			const clipText = this._quality?.clipText;
			const strokeScale = typeof clipText === "number" ? clipText : 1;
			const margin = 1;
			const graphemeToLine = /* @__PURE__ */ new Map();
			layout.lines.forEach((line, li) => {
				for (const charIdx of line) graphemeToLine.set(charIdx, li);
			});
			const ink = {
				minX: Infinity,
				minY: Infinity,
				maxX: -Infinity,
				maxY: -Infinity
			};
			for (const entry of this._timeline.entries) {
				if (entry.char === "\n" || !entry.hasGlyph) continue;
				const lineIdx = graphemeToLine.get(entry.graphemeIndex);
				if (lineIdx === void 0) continue;
				const glyph = (entry.glyphId !== void 0 ? font.glyphDataById?.[entry.glyphId] : void 0) ?? lookupGlyphData(font, entry.char);
				const bounds = glyph && glyphInkBounds(glyph);
				if (!bounds) continue;
				const { x, glyphY } = entryOrigin(entry, layout, lineIdx, fontSize, lineHeight, halfLeading);
				const reach = bounds.reach * strokeScale * scale + margin;
				ink.minX = Math.min(ink.minX, x + bounds.minX * scale - reach);
				ink.maxX = Math.max(ink.maxX, x + bounds.maxX * scale + reach);
				ink.minY = Math.min(ink.minY, glyphY + (bounds.minY + font.ascender) * scale - reach);
				ink.maxY = Math.max(ink.maxY, glyphY + (bounds.maxY + font.ascender) * scale + reach);
			}
			const pluginBox = this._pluginBounds(fontSize);
			if (pluginBox) {
				ink.minX = Math.min(ink.minX, pluginBox.minX - 1);
				ink.minY = Math.min(ink.minY, pluginBox.minY - 1);
				ink.maxX = Math.max(ink.maxX, pluginBox.maxX + 1);
				ink.maxY = Math.max(ink.maxY, pluginBox.maxY + 1);
			}
			const { padH, padV } = this._canvasPadding(fontSize, lineHeight);
			const dx = padH - cur.left;
			const dy = padV - cur.top;
			next = inkOverflow({
				minX: ink.minX + dx,
				maxX: ink.maxX + dx,
				minY: ink.minY + dy,
				maxY: ink.maxY + dy
			}, this._canvasEl.offsetWidth - cur.left - cur.right, this._canvasEl.offsetHeight - cur.top - cur.bottom);
		}
		if (next.left === cur.left && next.top === cur.top && next.right === cur.right && next.bottom === cur.bottom) return;
		this._canvasOverflow = next;
		Object.assign(this._canvasEl.style, canvasBoxStyle(next));
	}
	/**
	* The outline of every glyph the text draws, placed as the strokes are
	* (absolute px with the canvas padding), so SVG export can clip to the text
	* without embedding the font. Null unless the shaper provides outlines and
	* every visible character is a shaped glyph of the bundle's font.
	*/
	_glyphOutlines(graphemeToLine, padH = 0, padV = 0) {
		const font = this._font;
		const layout = this._layout;
		const fontSize = this._fontSize;
		const shaper = this._shaper;
		const entries = this._timeline.entries;
		if (!font || !layout || !fontSize || !shaper?.glyphPath || drawsFallbackGlyphs(entries)) return null;
		let lines = graphemeToLine;
		if (!lines) {
			lines = new Int32Array(graphemes(this._text).length).fill(-1);
			for (let li = 0; li < layout.lines.length; li++) for (const charIdx of layout.lines[li]) lines[charIdx] = li;
		}
		const lineHeight = this._lineHeight;
		const scale = fontSize / font.unitsPerEm;
		const halfLeading = (lineHeight - (font.ascender - font.descender) / font.unitsPerEm * fontSize) / 2;
		const out = [];
		for (const entry of entries) {
			if (!/\S/u.test(entry.char)) continue;
			if (entry.glyphId === void 0) return null;
			const lineIdx = lines[entry.graphemeIndex] ?? -1;
			if (lineIdx < 0) continue;
			const d = shaper.glyphPath(entry.glyphId);
			if (d === null) return null;
			const { x, glyphY } = entryOrigin(entry, layout, lineIdx, fontSize, lineHeight, halfLeading);
			out.push({
				d,
				x: padH + x,
				y: padV + glyphY + font.ascender * scale,
				scale,
				seed: this._seed + entry.graphemeIndex
			});
		}
		return out;
	}
	/**
	* A `Path2D` per outline for the clip mask. Without an `outline` hook,
	* each outline's own path data in font units, parsed once per shaper and
	* filled under its glyph's transform (`placed: false`). With one, flattened
	* as finely as the strokes are subdivided (`segmentLengthFU`), placed in
	* text-box px and reshaped by the hooks.
	*/
	_outlinePaths(outlines, segmentLengthFU, ascender, fontSize, textBox) {
		const plugins = this._allPlugins();
		const { steps, key: stepKey } = shapeSteps(this._steps.steps);
		const reshape = outlineWith(plugins, this._reportPluginError, steps);
		const step = reshape ? segmentLengthFU : 0;
		const key = reshape ? plugins : null;
		if (this._maskPaths.shaper !== this._shaper || this._maskPaths.plugins !== key || this._maskPaths.step !== step) this._maskPaths = {
			shaper: this._shaper,
			plugins: key,
			step,
			paths: /* @__PURE__ */ new Map()
		};
		const cache = this._maskPaths.paths;
		return outlines.map((g) => {
			if (!reshape) {
				let path = cache.get(g.d);
				if (!path) cache.set(g.d, path = new Path2D(g.d));
				return {
					path,
					placed: false
				};
			}
			const seed = g.seed ?? 0;
			const id = `${stepKey}|${seed}|${g.x}|${g.y}|${g.scale}|${textBox.minX},${textBox.minY},${textBox.maxX},${textBox.maxY}|${g.d}`;
			let path = cache.get(id);
			if (!path) {
				path = new Path2D();
				for (const out of this._reshapedContours(g, segmentLengthFU, ascender, fontSize, textBox, reshape)) {
					for (let i = 0; i < out.length; i++) if (i === 0) path.moveTo(out[i].x, out[i].y);
					else path.lineTo(out[i].x, out[i].y);
					path.closePath();
				}
				cache.set(id, path);
			}
			return {
				path,
				placed: true
			};
		});
	}
	/** An outline's contours, flattened as finely as the strokes are subdivided, placed in px and reshaped by the `outline` hooks. */
	_reshapedContours(g, segmentLengthFU, ascender, fontSize, textBox, reshape) {
		const place = {
			x: g.x,
			y: g.y - ascender * g.scale,
			scale: g.scale,
			ascender
		};
		return flattenPath(g.d, segmentLengthFU).map((contour) => {
			const pts = [];
			for (let i = 0; i < contour.length; i += 2) pts.push({
				x: g.x + contour[i] * g.scale,
				y: g.y - contour[i + 1] * g.scale
			});
			return reshape(pts, {
				place,
				seed: g.seed ?? 0,
				fontSize,
				textBox
			});
		});
	}
	/**
	* The stroke subdivision threshold in font units — Infinity for the raw
	* polyline. It collapses every input that matters (segmentSize in CSS px,
	* fontSize, unitsPerEm, whether the ink varies along a stroke) into one value.
	*/
	_subdivision(scale) {
		const varies = this._pressure > 0 || this._plugins.some((p) => p.geometry || p.paint);
		const smoothing = this._quality?.smoothing === true;
		const resolvedSegmentSize = this._quality?.segmentSize ?? (varies || smoothing ? 2 : void 0);
		return {
			maxSegLenFU: resolvedSegmentSize != null ? resolvedSegmentSize / scale : Infinity,
			smoothing
		};
	}
	/**
	* Every stroke placed in the current layout (see `placeStrokes`) and
	* reshaped by the plugins' `geometry` (the pressure step's first),
	* memoized for everything that moves or reshapes the ink: the strokes, the
	* layout, font size and line height, the plugins, quality (subdivision,
	* clip-to-text width) and the seed.
	*/
	_placedStrokes(steps = this._steps.steps) {
		const shaped = this._shapedStrokes(steps);
		const timeline = this._timeline;
		if (timeline === this._scheduled) return shaped;
		let timed = this._timedPlaced.get(shaped);
		if (timed?.timeline !== timeline) {
			const byId = new Map(this._strokesOf(timeline).map((s) => [s.id, s]));
			const list = shaped.map((s) => {
				const t = byId.get(s.id);
				return t && (t.start !== s.start || t.duration !== s.duration || t.entry !== s.entry) ? {
					...s,
					start: t.start,
					duration: t.duration,
					entry: t.entry
				} : s;
			});
			this._timedPlaced.set(shaped, timed = {
				timeline,
				list
			});
		}
		return timed.list;
	}
	/** The strokes placed and shaped (see `_placedStrokes`), at the times they're scheduled for. */
	_shapedStrokes(steps) {
		const font = this._font;
		const layout = this._layout;
		const fontSize = this._fontSize;
		if (!font?.glyphData || !layout || !fontSize) return [];
		const strokes = this._strokesOf(this._scheduled);
		const lineHeight = this._lineHeight;
		const plugins = this._allPlugins();
		const deps = [
			strokes,
			layout,
			fontSize,
			lineHeight,
			plugins,
			this._quality,
			this._seed
		];
		if (!this._placed?.deps.every((d, i) => d === deps[i])) this._placed = {
			deps,
			byStep: /* @__PURE__ */ new Map()
		};
		const byStep = this._placed.byStep;
		const shaping = shapeSteps(steps);
		const stepKey = shaping.key;
		const cached = byStep.get(stepKey);
		if (cached) return cached;
		const scale = fontSize / font.unitsPerEm;
		const halfLeading = (lineHeight - (font.ascender - font.descender) / font.unitsPerEm * fontSize) / 2;
		const graphemeToLine = /* @__PURE__ */ new Map();
		layout.lines.forEach((line, li) => {
			for (const charIdx of line) graphemeToLine.set(charIdx, li);
		});
		const entries = this._scheduled.entries;
		const random = (key) => seededRandom(this._seed, key);
		const list = placeStrokes(strokes, {
			reshape: reshapeWith(plugins, {
				fontSize,
				random,
				textBox: this._textBox(layout, fontSize, lineHeight)
			}, this._reportPluginError, shaping.steps),
			getSubdivided: this._subdivider(font, scale),
			placeEntry: (ei) => {
				const entry = entries[ei];
				const lineIdx = graphemeToLine.get(entry.graphemeIndex);
				if (lineIdx === void 0) return null;
				const { x, glyphY } = entryOrigin(entry, layout, lineIdx, fontSize, lineHeight, halfLeading);
				return {
					x,
					y: glyphY,
					scale,
					ascender: font.ascender,
					seed: this._seed + entry.graphemeIndex
				};
			}
		});
		byStep.set(stepKey, list);
		return list;
	}
	/** The clock plugin steps run on: the time in controlled mode (so a video draws the same every time), seconds since the engine started otherwise. */
	_stepClock() {
		if (this._timeControl.mode === "controlled") return this.currentTime;
		return ((typeof performance !== "undefined" ? performance.now() : 0) - this._clockOrigin) / 1e3;
	}
	/** Each stepped plugin's drawing now — the first of each under reduced motion. */
	_stepsNow() {
		return pluginStepsAt(this._allPlugins(), this._motionReduced ? 0 : this._stepClock());
	}
	/**
	* Run the idle loop while a plugin's steps should cycle on their own: some
	* plugin asks for it (`steps.idle`), time isn't controlled, motion isn't
	* reduced, and the canvas is on screen — the steps' clock runs on
	* regardless, so it picks up where it would be. It redraws only when the
	* drawing changes.
	*/
	_updateIdleLoop() {
		const want = !this._destroyed && this._onScreen && this._timeControl.mode !== "controlled" && !this._motionReduced && steppedPlugins(this._allPlugins()).some((s) => s.steps.idle);
		if (want && !this._idleRafId) this._idleRafId = requestAnimationFrame(this._idleTick);
		else if (!want && this._idleRafId) {
			cancelAnimationFrame(this._idleRafId);
			this._idleRafId = 0;
		}
	}
	_onIntersect = (entries) => {
		const entry = entries[entries.length - 1];
		if (!entry || entry.isIntersecting === this._onScreen) return;
		this._onScreen = entry.isIntersecting;
		this._updateIdleLoop();
	};
	_idleTick = () => {
		this._idleRafId = 0;
		if (this._destroyed) return;
		if (this._stepsNow().key !== this._steps.key) this._render();
		this._updateIdleLoop();
	};
	/** The pressure step, then the user's plugins: every plugin the engine runs, in order. */
	_allPlugins() {
		const cached = this._allPluginsCache;
		if (cached?.pressure === this._pressure && cached.user === this._plugins) return cached.list;
		const list = [pressurePlugin(this._pressure), ...this._plugins];
		this._allPluginsCache = {
			pressure: this._pressure,
			user: this._plugins,
			list
		};
		return list;
	}
	/**
	* Take `specs` as the `plugins` option: resolve its named entries through
	* the registry, and listen for registrations while it names any, so a name
	* registered later (or again) is picked up. Whether the plugins changed.
	*/
	_setPlugins(specs) {
		this._pluginSpecs = specs;
		const named = specs.some((s) => typeof s === "string" || Array.isArray(s));
		if (named && !this._offRegistry) this._offRegistry = onPluginRegistered((names) => {
			if (this._destroyed || !namesAny(this._pluginSpecs, names)) return;
			if (this._setPlugins(this._pluginSpecs)) {
				this._render();
				this._updateIdleLoop();
			}
		});
		else if (!named && this._offRegistry) {
			this._offRegistry();
			this._offRegistry = null;
		}
		const { plugins } = this._pluginResolver.resolve(specs);
		const prev = this._plugins;
		if (plugins.length === prev.length && plugins.every((p, i) => p === prev[i])) return false;
		this._plugins = plugins;
		syncAttachments(this._attached, plugins, this._attachContext, this._reportPluginError);
		return true;
	}
	/** The box a placed stroke's ink covers, worked out once per placement. */
	_inkBox(stroke) {
		let box = this._inkBoxes.get(stroke.path);
		if (box === void 0) this._inkBoxes.set(stroke.path, box = strokeInkBounds(stroke));
		return box;
	}
	/** Report a plugin hook that threw — once per plugin and hook, not every frame. */
	/** What an attached plugin's `attach` gets: a redraw that stops working once it's detached. */
	_attachContext = (attachment) => ({ redraw: () => {
		if (!attachment.live || this._destroyed || this._redrawRafId) return;
		this._redrawRafId = requestAnimationFrame(() => {
			this._redrawRafId = 0;
			if (!this._destroyed && !this._rafId) this._render();
		});
	} });
	_reportPluginError = (plugin, hook, error) => {
		const key = `${plugin.name}:${hook}`;
		if (this._pluginErrors.has(key)) return;
		this._pluginErrors.add(key);
		console.error(`[tegaki] plugin "${plugin.name}" threw in ${hook}:`, error);
	};
	/** Run a plugin hook. One that throws is reported once and doesn't stop the render. */
	_runHook(plugin, hook, fn) {
		try {
			fn();
		} catch (error) {
			this._reportPluginError(plugin, hook, error);
		}
	}
	/**
	* The box the ink covers once drawn, as the plugins reshape it, together
	* with the plugins' `bounds`, in text-box px; null with no strokes.
	*/
	_pluginBounds(fontSize) {
		const plugins = this._allPlugins();
		this._placedStrokes();
		const placed = this._placed;
		if (!placed) return null;
		const cached = this._pluginBoundsCache;
		if (cached?.placed === placed && cached.plugins === plugins) return cached.box;
		const boxes = [];
		for (const steps of allPluginSteps(plugins)) {
			const strokes = this._placedStrokes(steps);
			for (const stroke of strokes) boxes.push(strokeInkBounds(stroke));
			for (const plugin of plugins) if (plugin.bounds) this._runHook(plugin, "bounds", () => boxes.push(plugin.bounds({
				strokes,
				fontSize
			})));
		}
		const box = unionBoxes(boxes);
		this._pluginBoundsCache = {
			placed,
			plugins,
			box
		};
		return box;
	}
	/** The box the text's lines fill, in text-box px — what `globalGradient` spans. */
	_textBox(layout, fontSize, lineHeight) {
		const cached = this._textBoxCache;
		if (cached?.layout === layout && cached.fontSize === fontSize && cached.lineHeight === lineHeight) return cached.box;
		const b = computeLayoutBbox(layout, fontSize, lineHeight);
		const box = {
			minX: b.x,
			minY: b.y,
			maxX: b.x + b.width,
			maxY: b.y + b.height
		};
		this._textBoxCache = {
			layout,
			fontSize,
			lineHeight,
			box
		};
		return box;
	}
	/** Hand the finished ink to every `ink` hook (a copy to read, the canvas to draw on). */
	_renderInk(ctx, plugins, fontSize, color, clipped, bounds, frame) {
		const steps = this._steps.steps;
		const context = {
			ctx,
			bounds,
			fontSize,
			color,
			clipped,
			frame,
			random: (key) => seededRandom(this._seed, key),
			step: 0
		};
		for (const plugin of plugins) {
			if (!plugin.ink) continue;
			context.step = steps.get(plugin) ?? 0;
			ctx.save();
			this._runHook(plugin, "ink", () => plugin.ink(context));
			ctx.restore();
		}
	}
	/**
	* Paint the plugins' underlays (on a canvas of their own, laid under the
	* finished ink, so clip-to-text doesn't cut them) and overlays, then hand
	* the frame to every `onFrame`. `ctx` is in text-box px.
	*/
	_renderPlugins(ctx, plugins, frame, fontSize, color, clipped) {
		const steps = this._steps.steps;
		const paint = {
			ctx,
			frame,
			fontSize,
			color,
			clipped,
			random: (key) => seededRandom(this._seed, key),
			step: 0
		};
		if (plugins.some((p) => p.underlay)) {
			const canvas = this._canvasEl;
			if (!this._underlayCanvas) this._underlayCanvas = document.createElement("canvas");
			const under = this._underlayCanvas;
			if (under.width !== canvas.width || under.height !== canvas.height) {
				under.width = canvas.width;
				under.height = canvas.height;
			}
			const uctx = under.getContext("2d");
			uctx.setTransform(1, 0, 0, 1, 0, 0);
			uctx.clearRect(0, 0, under.width, under.height);
			uctx.setTransform(ctx.getTransform());
			for (const plugin of plugins) {
				if (!plugin.underlay) continue;
				uctx.save();
				this._runHook(plugin, "underlay", () => plugin.underlay({
					...paint,
					ctx: uctx,
					step: steps.get(plugin) ?? 0
				}));
				uctx.restore();
			}
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalCompositeOperation = "destination-over";
			ctx.drawImage(under, 0, 0);
			ctx.restore();
		}
		for (const plugin of plugins) {
			if (!plugin.overlay) continue;
			ctx.save();
			this._runHook(plugin, "overlay", () => plugin.overlay({
				...paint,
				step: steps.get(plugin) ?? 0
			}));
			ctx.restore();
		}
		const prev = this._prevFrame;
		for (const plugin of plugins) if (plugin.onFrame) this._runHook(plugin, "onFrame", () => plugin.onFrame(frame, prev));
		this._prevFrame = frame;
	}
	/**
	* The engine's cached stroke subdivision at `scale`. `maxSegLenFU` (see
	* `_subdivision`), the subdivision threshold in font units, collapses every input that matters (segmentSize in CSS px,
	* fontSize, unitsPerEm, whether the ink varies along a stroke) into a single
	* value, so the cache key is just (font family, maxSegLenFU, smoothing).
	* When anything that affects subdivision changes, the key changes and the
	* WeakMap is swapped out.
	*/
	_subdivider(font, scale) {
		const { maxSegLenFU, smoothing } = this._subdivision(scale);
		const cacheKey = `${font.family}|${maxSegLenFU}|${smoothing ? "s" : "l"}`;
		if (cacheKey !== this._strokeCacheKey) {
			this._strokeCache = /* @__PURE__ */ new WeakMap();
			this._strokeCacheKey = cacheKey;
		}
		const strokeCache = this._strokeCache;
		return (stroke) => {
			let sub = strokeCache.get(stroke);
			if (!sub) {
				sub = subdivideStroke(stroke, maxSegLenFU, smoothing);
				strokeCache.set(stroke, sub);
			}
			return sub;
		};
	}
	_render() {
		this._timelineChanged();
		const canvas = this._canvasEl;
		const font = this._font;
		const layout = this._layout;
		const fontSize = this._fontSize;
		const effectiveDpr = (window.devicePixelRatio || 1) * Math.max(this._quality?.pixelRatio ?? 1, 0);
		this._steps = this._stepsNow();
		this._fitCanvasToInk();
		const w = canvas.offsetWidth;
		const h = canvas.offsetHeight;
		if (canvas.width !== Math.round(w * effectiveDpr) || canvas.height !== Math.round(h * effectiveDpr)) {
			canvas.width = Math.round(w * effectiveDpr);
			canvas.height = Math.round(h * effectiveDpr);
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		if (!font?.glyphData || !layout || !fontSize) return;
		const lineHeight = this._lineHeight;
		const { padH, padV } = this._canvasPadding(fontSize, lineHeight);
		ctx.translate(padH, padV);
		const color = this._currentColor || "black";
		const halfLeading = (lineHeight - (font.ascender - font.descender) / font.unitsPerEm * fontSize) / 2;
		const characters = graphemes(this._text);
		const currentTime = this.currentTime;
		const scale = fontSize / font.unitsPerEm;
		const { maxSegLenFU } = this._subdivision(scale);
		const clipText = this._quality?.clipText;
		const plugins = this._allPlugins();
		const random = (key) => seededRandom(this._seed, key);
		const frame = sampleFrame(this._placedStrokes(), currentTime, this._timing);
		const strokes = frame.strokes;
		const widen = typeof clipText === "number" && clipText !== 1 ? clipText : 1;
		const painter = widen === 1 ? paintStroke : (s) => paintStroke(s.ctx === ctx && s.stroke.state !== "pending" ? {
			...s,
			stroke: {
				...s.stroke,
				path: this._widened(s.stroke.path, widen)
			}
		} : s);
		const paint = paintWith(plugins, this._reportPluginError, painter, this._steps.steps);
		const ahead = this._plugins.some(paintsAhead);
		let unclipped = ctx;
		if (clipText && ahead) {
			if (!this._unclippedCanvas) this._unclippedCanvas = document.createElement("canvas");
			const layer = this._unclippedCanvas;
			if (layer.width !== canvas.width || layer.height !== canvas.height) {
				layer.width = canvas.width;
				layer.height = canvas.height;
			}
			const lctx = layer.getContext("2d");
			lctx.setTransform(1, 0, 0, 1, 0, 0);
			lctx.clearRect(0, 0, layer.width, layer.height);
			lctx.setTransform(ctx.getTransform());
			unclipped = lctx;
		}
		const textBox = this._textBox(layout, fontSize, lineHeight);
		const clipped = !!clipText;
		const inkBoxes = [];
		const graphemeToLine = new Int32Array(characters.length).fill(-1);
		for (let li = 0; li < layout.lines.length; li++) {
			const lineIndices = layout.lines[li];
			for (const charIdx of lineIndices) graphemeToLine[charIdx] = li;
		}
		const fallbackClips = this._fallbackRunClips(layout, characters, graphemeToLine, fontSize);
		let si = 0;
		for (let ei = 0; ei < this._timeline.entries.length; ei++) {
			const entry = this._timeline.entries[ei];
			if (entry.char === "\n") continue;
			const lineIdx = graphemeToLine[entry.graphemeIndex] ?? -1;
			if (lineIdx < 0) continue;
			if (entry.hasGlyph) {
				while (si < strokes.length && strokes[si].entryIndex < ei) si++;
				for (; si < strokes.length && strokes[si].entryIndex === ei; si++) {
					const stroke = strokes[si];
					if (stroke.state === "pending" && !ahead) continue;
					paint({
						ctx,
						unclipped,
						stroke,
						style: color,
						lineCap: font.lineCap,
						color,
						clipped,
						fontSize,
						textBox,
						frame,
						random
					});
					if (stroke.state !== "pending" || ahead) inkBoxes.push(this._inkBox(stroke));
				}
			} else if (currentTime >= entry.offset + entry.duration) {
				const { x, y } = entryOrigin(entry, layout, lineIdx, fontSize, lineHeight, halfLeading);
				const baseline = y + halfLeading + font.ascender / font.unitsPerEm * fontSize;
				const clip = fallbackClips.get(ei);
				if (clip === null) continue;
				if (clip) {
					ctx.save();
					ctx.beginPath();
					ctx.rect(clip.left, -1e6, clip.right - clip.left, 2 * CLIP_REACH);
					ctx.clip();
				}
				drawFallbackGlyph(ctx, clip?.text ?? entry.char, clip?.x ?? x, baseline, fontSize, cssFontFamily(font, this._fallbackFont), color, clip?.direction ?? layout.direction ?? "ltr", font.weight);
				if (clip) ctx.restore();
				inkBoxes.push(textBox);
			}
		}
		const drawn = unionBoxes(inkBoxes);
		if (clipText) {
			if (!this._maskCanvas) this._maskCanvas = document.createElement("canvas");
			const maskCanvas = this._maskCanvas;
			const maskKey = [
				canvas.width,
				canvas.height,
				effectiveDpr,
				padH,
				padV,
				layout,
				this._timeline,
				font,
				fontSize,
				lineHeight,
				this._letterSpacing,
				this._fallbackFont,
				this._shaper,
				plugins,
				maxSegLenFU,
				document.fonts?.status,
				shapeSteps(this._steps.steps).key
			];
			const lastKey = this._maskKey;
			if (!lastKey || lastKey.length !== maskKey.length || maskKey.some((v, i) => v !== lastKey[i])) {
				this._maskKey = maskKey;
				if (maskCanvas.width !== canvas.width || maskCanvas.height !== canvas.height) {
					maskCanvas.width = canvas.width;
					maskCanvas.height = canvas.height;
				}
				const maskCtx = maskCanvas.getContext("2d");
				maskCtx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
				maskCtx.clearRect(0, 0, w, h);
				maskCtx.translate(padH, padV);
				const outlines = this._glyphOutlines(graphemeToLine);
				if (outlines) {
					const paths = this._outlinePaths(outlines, maxSegLenFU, font.ascender, fontSize, textBox);
					for (let i = 0; i < outlines.length; i++) {
						const g = outlines[i];
						const { path, placed } = paths[i];
						if (placed) {
							maskCtx.fill(path);
							continue;
						}
						maskCtx.save();
						maskCtx.translate(g.x, g.y);
						maskCtx.scale(g.scale, -g.scale);
						maskCtx.fill(path);
						maskCtx.restore();
					}
				}
				maskCtx.font = `${font.weight ?? 400} ${fontSize}px ${cssFontFamily(font, this._fallbackFont)}`;
				maskCtx.textBaseline = "alphabetic";
				maskCtx.textAlign = "left";
				if ("letterSpacing" in maskCtx) maskCtx.letterSpacing = `${this._letterSpacing}px`;
				let clipY = 0;
				for (let li = 0; !outlines && li < layout.lines.length; li++) {
					const baseline = clipY + halfLeading + font.ascender / font.unitsPerEm * fontSize;
					for (const word of lineWords(layout, characters, li)) {
						maskCtx.direction = word.direction;
						maskCtx.fillText(word.text, word.leftEm * fontSize, baseline);
					}
					clipY += lineHeight;
				}
			}
			const region = ahead ? {
				minX: -padH,
				minY: -padV,
				maxX: w - padH,
				maxY: h - padV
			} : expandBox(drawn, .05 * fontSize);
			if (region) {
				const m = ctx.getTransform();
				const x0 = Math.max(0, Math.floor(m.a * region.minX + m.e) - 1);
				const y0 = Math.max(0, Math.floor(m.d * region.minY + m.f) - 1);
				const x1 = Math.min(canvas.width, Math.ceil(m.a * region.maxX + m.e) + 1);
				const y1 = Math.min(canvas.height, Math.ceil(m.d * region.maxY + m.f) + 1);
				if (x1 > x0 && y1 > y0) {
					ctx.save();
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.beginPath();
					ctx.rect(x0, y0, x1 - x0, y1 - y0);
					ctx.clip();
					ctx.globalCompositeOperation = "destination-in";
					ctx.drawImage(maskCanvas, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
					ctx.restore();
				}
			}
		}
		if (unclipped !== ctx) {
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalCompositeOperation = "destination-over";
			ctx.drawImage(unclipped.canvas, 0, 0);
			ctx.restore();
		}
		if (plugins.some((p) => p.ink)) this._renderInk(ctx, plugins, fontSize, color, clipped, drawn, frame);
		if (plugins.some((p) => p.underlay || p.overlay || p.onFrame)) this._renderPlugins(ctx, plugins, frame, fontSize, color, clipped);
	}
};
//#endregion
export { glowPlugin as a, bundleForWeight as c, variationPlugin as i, bundleWeights as l, drawGlyph as n, boilPlugin as o, createBundle as r, textToSvg as s, TegakiEngine as t, matchFontWeight as u };

