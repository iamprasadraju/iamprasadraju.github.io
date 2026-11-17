//#region src/lib/bidi.ts
/** Scripts written right to left (their letters are bidi class R / AL). */
const RTL_SCRIPT_RE = /[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}]/u;
const LETTER_RE = /\p{L}/u;
const COMMON_SCRIPT_RE = /[\p{Script=Common}\p{Script=Inherited}]/u;
const DIGIT_RE = /\p{Nd}/u;
/**
* The direction a character forces on its run, or `null` for one that takes
* its neighbours' (punctuation, marks, the Arabic tatweel). Digits are LTR
* even in an RTL script — bidi lays `١٢` out left to right — so they get a
* run of their own instead of being reversed with the Arabic around them.
* A simplification of the Unicode bidi classes: enough to find where a word
* switches direction — harfbuzz shapes one direction per buffer, and the
* browser's bidi may put the two halves far apart on the line.
*/
function strongDirection(cp) {
	const ch = String.fromCodePoint(cp);
	if (DIGIT_RE.test(ch)) return "ltr";
	if (RTL_SCRIPT_RE.test(ch)) return "rtl";
	if (LETTER_RE.test(ch) && !COMMON_SCRIPT_RE.test(ch)) return "ltr";
	return null;
}
/**
* The base direction `dir="auto"` gives `text`: that of its first strong
* letter (digits don't count), LTR when it has none.
*/
function paragraphDirection(text) {
	for (const ch of text) {
		const cp = ch.codePointAt(0);
		if (DIGIT_RE.test(ch)) continue;
		const direction = strongDirection(cp);
		if (direction) return direction;
	}
	return "ltr";
}
/** Opening → closing bracket, for the pairs bidi resolves together (Bidi_Paired_Bracket). */
const BRACKET_PAIRS = /* @__PURE__ */ new Map([
	["(", ")"],
	["[", "]"],
	["{", "}"],
	["〈", "〉"],
	["⟦", "⟧"],
	["⟨", "⟩"],
	["〈", "〉"],
	["（", "）"],
	["［", "］"],
	["｛", "｝"]
]);
/** Closing → opening bracket. */
const CLOSING_BRACKETS = new Map([...BRACKET_PAIRS].map(([open, close]) => [close, open]));
/** Separators a number keeps inside it when they stand between two digits (`1:2`, `3.5`) — bidi rule W4. */
const SEPARATOR_RE = /^[,.:/+\-\u00a0\u060c\u066b\u066c]$/u;
/** Signs a number takes in when next to its digits (`50%`, `$5`) — rule W5. */
const TERMINATOR_RE = /^[#$%\u00b0\u2030\u2031\u066a\p{Sc}]$/u;
/** Marks and format characters (ZWJ) go with the character before them — rule W1. */
const ATTACHED_RE = /^[\p{M}\p{Cf}]$/u;
/** Bracket pairs of `text` as [open, close] UTF-16 offsets, matched the way bidi rule BD16 does, in order of opening. */
function bracketPairs(text) {
	const pairs = [];
	const stack = [];
	for (let i = 0; i < text.length; i++) {
		const close = BRACKET_PAIRS.get(text[i]);
		if (close) {
			if (stack.length === 63) break;
			stack.push({
				at: i,
				close
			});
			continue;
		}
		if (!CLOSING_BRACKETS.has(text[i])) continue;
		for (let j = stack.length - 1; j >= 0; j--) {
			if (stack[j].close !== text[i]) continue;
			pairs.push([stack[j].at, i]);
			stack.length = j;
			break;
		}
	}
	return pairs.sort((a, b) => a[0] - b[0]);
}
/**
* The direction each character of `text` is laid out in, by UTF-16 offset,
* in a paragraph of direction `base` — a single-level take on the Unicode
* bidi algorithm, enough to split text into the runs the browser shapes:
*
* - letters have their own direction, and a number is LTR — with the
*   separators between its digits and the signs next to them (`1:2`, `50%`);
* - a bracket pair goes by what it encloses (rule N0): the paragraph's
*   direction if any of it is, else the other when the text before the pair
*   is too — so `( b )` stays LTR after a Latin word in an RTL paragraph —
*   and a resolved bracket counts as strong for what follows it;
* - other neutral characters between two strong ones of one direction take
*   it, and the paragraph's otherwise (N1/N2). A digit counts as the letter
*   before it here: after Hebrew it keeps a bracket RTL.
* - marks and joiners go with the character before them.
*/
function resolvedDirections(text, base) {
	const n = text.length;
	const own = new Array(n).fill(null);
	const attached = new Array(n).fill(false);
	for (let i = 0; i < n;) {
		const cp = text.codePointAt(i);
		const ch = String.fromCodePoint(cp);
		const strong = strongDirection(cp);
		const type = strong ? DIGIT_RE.test(ch) ? "digit" : strong : null;
		const isAttached = !strong && i > 0 && ATTACHED_RE.test(ch);
		for (let k = i; k < i + ch.length; k++) {
			own[k] = isAttached ? own[i - 1] : type;
			attached[k] = isAttached;
		}
		i += ch.length;
	}
	for (let i = 1; i < n - 1; i++) if (own[i] === null && own[i - 1] === "digit" && own[i + 1] === "digit" && SEPARATOR_RE.test(text[i])) own[i] = "digit";
	for (let i = 0; i < n; i++) {
		if (own[i] !== null || !TERMINATOR_RE.test(text[i])) continue;
		let end = i;
		while (end < n && own[end] === null && TERMINATOR_RE.test(text[end])) end++;
		if (own[i - 1] === "digit" || own[end] === "digit") own.fill("digit", i, end);
		i = end - 1;
	}
	const type = new Array(n).fill(null);
	let letter = base;
	for (let i = 0; i < n; i++) {
		const t = own[i];
		if (t === "digit") type[i] = letter;
		else if (t) type[i] = letter = t;
	}
	const before = (at) => {
		for (let k = at - 1; k >= 0; k--) if (type[k]) return type[k];
		return base;
	};
	for (const [open, close] of bracketPairs(text)) {
		let embedding = false;
		let opposite = false;
		for (let k = open + 1; k < close; k++) if (type[k] === base) embedding = true;
		else if (type[k]) opposite = true;
		if (!embedding && !opposite) continue;
		type[open] = type[close] = embedding ? base : before(open);
	}
	for (let i = 0; i < n;) {
		if (type[i]) {
			i++;
			continue;
		}
		let end = i;
		while (end < n && !type[end]) end++;
		const prev = before(i);
		const next = end < n ? type[end] : base;
		type.fill(prev === next ? prev : base, i, end);
		i = end;
	}
	const out = own.map((t, i) => t === "digit" ? "ltr" : t ?? type[i]);
	for (let i = 1; i < n; i++) if (attached[i]) out[i] = out[i - 1];
	return out;
}
//#endregion
//#region src/lib/itemize.ts
/** ISO 15924 tags harfbuzz takes for `setScript`, tested against each character's Script property. */
const SCRIPTS = [
	"Latn",
	"Grek",
	"Cyrl",
	"Armn",
	"Hebr",
	"Arab",
	"Syrc",
	"Thaa",
	"Nkoo",
	"Deva",
	"Beng",
	"Guru",
	"Gujr",
	"Orya",
	"Taml",
	"Telu",
	"Knda",
	"Mlym",
	"Sinh",
	"Thai",
	"Laoo",
	"Tibt",
	"Mymr",
	"Geor",
	"Hang",
	"Ethi",
	"Khmr",
	"Mong",
	"Hira",
	"Kana",
	"Bopo",
	"Hani"
].map((tag) => ({
	tag,
	re: new RegExp(`\\p{Script=${tag}}`, "u")
}));
const COMMON_RE = /[\p{Script=Common}\p{Script=Inherited}]/u;
/** Japanese and Chinese text mixes these in one run, as browsers shape it. */
const HAN_GROUP = /* @__PURE__ */ new Set([
	"Hira",
	"Kana",
	"Bopo",
	"Hani"
]);
const OPENING = BRACKET_PAIRS;
const CLOSING = CLOSING_BRACKETS;
/** A character's own script tag, `'Zyyy'` for Common / Inherited, `'Zzzz'` for one not in {@link SCRIPTS}. */
function scriptOf(ch) {
	if (COMMON_RE.test(ch)) return "Zyyy";
	for (const { tag, re } of SCRIPTS) if (re.test(ch)) return tag;
	return "Zzzz";
}
/**
* The script each character of `text` is shaped in, by UTF-16 offset — as
* browsers itemize a paragraph: punctuation, marks and other Common
* characters take the script before them (the first one after, at the
* start), and a closing bracket takes its opening bracket's — as does the
* text after it. `null` where the text has no script of its own at all, or
* the script isn't one harfbuzz is told explicitly.
*
* It decides which glyph a font draws for shared punctuation: Amiri's
* default `[` is its wide Arabic bracket, with a narrow Latin one swapped in
* only for Latin text. Shaped alone, `[` in `Hello [مرحبا]` would take the
* Arabic one while the browser draws the Latin.
*/
function resolvedScripts(text, before = null) {
	const out = new Array(text.length).fill(null);
	const openers = [];
	let current = before;
	let started = before !== null;
	const pending = [];
	for (let i = 0; i < text.length;) {
		const cp = text.codePointAt(i);
		const ch = String.fromCodePoint(cp);
		const own = scriptOf(ch);
		let script = current;
		if (own !== "Zyyy") {
			script = current = own === "Zzzz" ? null : own;
			for (const at of pending) out[at] = script;
			pending.length = 0;
			started = true;
		} else if (CLOSING.has(ch)) {
			const j = openers.findLastIndex((o) => o.close === ch);
			if (j >= 0) {
				script = current = out[openers[j].at] ?? current;
				openers.length = j;
			}
		} else if (OPENING.has(ch)) openers.push({
			close: OPENING.get(ch),
			at: i
		});
		for (let k = i; k < i + ch.length; k++) {
			if (!started) pending.push(k);
			out[k] = script;
		}
		i += ch.length;
	}
	return out;
}
/**
* The script text after `text` continues in: its last character's resolved
* script — the last one of its own, or a closing bracket's opener's.
*/
function trailingScript(text) {
	return resolvedScripts(text).at(-1) ?? null;
}
/** Whether characters of these two scripts go in separate shaping runs. */
function scriptsDiffer(a, b) {
	if (a === b) return false;
	return !(a !== null && b !== null && HAN_GROUP.has(a) && HAN_GROUP.has(b));
}
//#endregion
//#region src/lib/features.ts
/**
* Features that harfbuzz's (and the browser's) complex-text shapers apply
* context-sensitively based on the script. Passing them in an explicit
* "enable" list tells the shaper to apply them unconditionally to the whole
* text range, which breaks the positional assignment — e.g. every Arabic
* glyph collapses to the final form.
*
* The fraction features (`frac`/`numr`/`dnom`) are the same kind: shapers
* apply them around a fraction slash on their own, and a blanket enable turns
* every digit into a numerator. It doesn't even do that consistently — a font
* may register them for one script only (Amiri: Arabic), so the browser, which
* shapes digits beside Arabic as Arabic, draws numerators where our per-word
* harfbuzz shaping, seeing bare digits, draws plain ones.
*
* Trust the shaper's script defaults for these and never emit them as
* explicit enables. (Explicit *disables* are fine — `-fina` suppressing the
* automatic fina is exactly the user's intent.)
*/
const SHAPER_MANAGED_FEATURES = /* @__PURE__ */ new Set([
	"init",
	"medi",
	"fina",
	"isol",
	"rlig",
	"frac",
	"numr",
	"dnom"
]);
/**
* Build a CSS `font-feature-settings` value from bundle features. Same
* filter as the HB path: shaper-managed tags are omitted so browsers keep
* their contextual positional assignment.
*
* Fonts with no declared features fall back to disabling `liga` + `calt`,
* which matches the legacy "1:1 char-to-glyph" assumption the renderer
* makes when it can't shape.
*/
function toCssFeatureSettings(enabled) {
	if (enabled.length === 0) return "'calt' 0, 'liga' 0";
	const explicit = enabled.filter((tag) => !SHAPER_MANAGED_FEATURES.has(tag));
	if (explicit.length === 0) return "normal";
	return explicit.map((f) => `'${f}' 1`).join(", ");
}
/**
* Features browsers switch off between letters spaced apart by a non-zero
* `letter-spacing`: the optional ligatures (CSS Text), plus contextual
* alternates, which Chrome drops too — Caveat's calt alternates vanish from
* the DOM at 1px of spacing, even with `'calt' 1` in the face's settings.
* The shaper drops them for spaced text (`ShapeOptions.letterSpaced`) and the
* engine disables them on the overlay explicitly, so every browser agrees.
*/
const LETTER_SPACED_OFF_FEATURES = [
	"liga",
	"clig",
	"dlig",
	"hlig",
	"calt"
];
/**
* Features the overlay switches off when the shaper is: every one that makes
* variant glyphs (ligatures, alternates, Arabic positional forms), since the
* renderer then draws each character's nominal glyph.
*/
const UNSHAPED_OFF_FEATURES = [
	"liga",
	"calt",
	"clig",
	"rlig",
	"dlig",
	"init",
	"medi",
	"fina",
	"isol"
];
//#endregion
export { scriptsDiffer as a, resolvedDirections as c, resolvedScripts as i, strongDirection as l, UNSHAPED_OFF_FEATURES as n, trailingScript as o, toCssFeatureSettings as r, paragraphDirection as s, LETTER_SPACED_OFF_FEATURES as t };

