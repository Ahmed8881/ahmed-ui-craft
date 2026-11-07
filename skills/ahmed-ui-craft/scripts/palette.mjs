#!/usr/bin/env node
// Generates the semantic color tokens for a direction, light + dark, with every pair
// solved to pass WCAG AA (checked by check-tokens.mjs before printing).
//
// Usage: node palette.mjs --hue 250 --accent 130 [--accent-chroma 0.2] [--tint 0.012]
//                         [--on-accent auto|light|dark] [--dark-first]
//        node palette.mjs --test
//   --hue      hue the neutrals are tinted toward (0-360), usually the brand hue
//   --accent   accent hue (0-360); complementary or split-complementary to --hue reads sharpest
//   --tint     neutral chroma, 0 = pure gray, 0.02 = clearly tinted
import { contrast, oklchToLinear } from "./contrast.mjs";
import { check } from "./check-tokens.mjs";
import { pathToFileURL } from "node:url";

const fmt = ([L, C, H]) => `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${Math.round(H)})`;
const inGamut = (L, C, H) => oklchToLinear(L, C, H).every((x) => x >= -0.0005 && x <= 1.0005);

// Largest chroma <= C that fits sRGB at this lightness and hue
function fit(L, C, H) {
  while (C > 0 && !inGamut(L, C, H)) C -= 0.002;
  return [L, Math.max(0, C), H];
}

// Lightness where this hue reaches its highest in-gamut chroma (yellows ~0.9, blues ~0.45)
function cusp(H) {
  let best = [0.6, 0];
  for (let L = 0.3; L <= 0.95; L += 0.01) { const [, c] = fit(L, 0.4, H); if (c > best[1]) best = [L, c]; }
  return best[0];
}

// Walk lightness from `from` toward `to` until ok(color) holds; returns the first passing color
function solve(from, to, C, H, ok) {
  const step = from < to ? 0.0025 : -0.0025;
  for (let L = from; step > 0 ? L <= to : L >= to; L += step) {
    const c = fit(L, C, H);
    if (ok(fmt(c))) return c;
  }
  throw new Error(`no lightness between ${from} and ${to} satisfies the contrast target for hue ${H}`);
}

const passes = (min, ...against) => (c) => against.every((bg) => contrast(c, bg) >= min);

export function palette({ hue, accent, accentChroma = 0.19, tint = 0.012, onAccent = "auto" }) {
  const n = (L, k = 1) => fmt(fit(L, tint * k, hue));
  const light = { bg: n(0.985, 0.5), surface: n(0.96, 0.8), raised: fmt([1, 0, 0]), text: n(0.2), border: n(0.86) };
  const dark = { bg: n(0.15), surface: n(0.2), raised: n(0.26), text: n(0.95, 0.6), border: n(0.33) };
  const T = 4.6, UI = 3.1; // small margins over 4.5 / 3 so rounding never flips a pass

  // Light-on-accent works for most hues; yellows, limes, and cyans need dark text
  const naturallyLight = (accent >= 70 && accent <= 210);
  const darkLabel = onAccent === "dark" || (onAccent === "auto" && naturallyLight);

  const out = { light: {}, dark: {} };
  for (const mode of ["light", "dark"]) {
    const s = mode === "light" ? light : dark;
    const lighter = mode === "dark"; // dark mode: search upward for readable colors
    const toward = (from) => [from, lighter ? 0.98 : 0.05];
    const o = out[mode];
    Object.assign(o, { bg: s.bg, surface: s.surface, raised: s.raised, text: s.text, border: s.border });
    o.muted = fmt(solve(...toward(lighter ? 0.6 : 0.55), tint * 1.4, hue, passes(T, s.bg, s.surface, s.raised)));
    o.borderStrong = fmt(solve(...toward(lighter ? 0.4 : 0.7), tint * 1.4, hue, passes(UI, s.bg, s.raised)));

    // Accent fill and its label
    // --on-accent light/dark applies to both themes; auto uses a dark label in dark mode
    const labelIsDark = mode === "dark" ? onAccent !== "light" : darkLabel;
    const label = labelIsDark ? (mode === "light" ? n(0.18) : dark.bg) : fmt([1, 0, 0]);
    // Start at the hue's most vivid lightness and move away from the label until it reads,
    // so yellows stay acid and blues stay deep instead of everything landing at a muddy middle
    const vivid = Math.min(0.9, Math.max(0.55, cusp(accent)));
    const accentFill = solve(labelIsDark ? vivid : Math.min(vivid, 0.72), labelIsDark ? 0.98 : 0.2, accentChroma, accent, passes(T, label));
    o.accent = fmt(accentFill);
    // Hover: one step darker when that still passes, otherwise the nearest passing lightness
    o.accentHover = fmt(solve(accentFill[0] - 0.06, labelIsDark ? 0.98 : 0.15, accentChroma, accent, passes(T, label)));
    o.onAccent = label;
    o.accentText = fmt(solve(...toward(lighter ? 0.6 : 0.55), accentChroma, accent, passes(T, s.bg)));
    o.focus = fmt(solve(...toward(accentFill[0]), accentChroma, accent, passes(UI, s.bg)));
    for (const [k, h, c] of [["success", 150, 0.14], ["warning", 70, 0.14], ["danger", 27, 0.19]]) {
      o[k] = fmt(solve(...toward(lighter ? 0.65 : 0.55), c, h, passes(T, s.bg)));
    }
  }
  out.light.inverse = out.light.text; out.light.onInverse = out.light.surface;
  out.dark.inverse = out.dark.text; out.dark.onInverse = out.dark.surface;
  return out;
}

const NAMES = {
  bg: "bg", surface: "surface", raised: "surface-raised", text: "text", muted: "text-muted",
  border: "border", borderStrong: "border-strong", inverse: "inverse-surface", onInverse: "on-inverse",
  accent: "accent", accentHover: "accent-hover", onAccent: "on-accent", accentText: "accent-text",
  success: "success", warning: "warning", danger: "danger", focus: "focus",
};

export function toCss(p, comment = "") {
  const lines = Object.entries(NAMES).map(([k, name]) => `  --color-${name}: light-dark(${p.light[k]}, ${p.dark[k]});`);
  return `${comment ? `/* ${comment} */\n` : ""}:root {\n${lines.join("\n")}\n}\n`;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
const argv = isMain ? process.argv.slice(2) : ["--imported"];
const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };

if (argv[0] === "--test") {
  let n = 0;
  for (const onAccent of ["auto", "light", "dark"]) for (const hue of [0, 60, 140, 250, 300]) for (let accent = 0; accent < 360; accent += 15) {
    const rows = check(toCss(palette({ hue, accent, onAccent })));
    const bad = rows.filter((r) => !r.ok);
    console.assert(rows.length === 30 && !bad.length, `${onAccent} hue ${hue} accent ${accent}: ${bad.map((r) => r.fg + "/" + r.theme).join(", ")}`);
    n++;
  }
  console.log(`ok (${n} palettes, all 30 pairs each)`);
} else if (opt("hue") !== undefined && opt("accent") !== undefined) {
  const params = {
    hue: +opt("hue"), accent: +opt("accent"), accentChroma: +opt("accent-chroma", 0.19),
    tint: +opt("tint", 0.012), onAccent: opt("on-accent", "auto"),
  };
  const css = toCss(palette(params), `palette.mjs --hue ${params.hue} --accent ${params.accent} | WCAG AA verified, light + dark`);
  const bad = check(css).filter((r) => !r.ok);
  if (bad.length) { console.error("Unexpected failures:", bad); process.exit(1); }
  process.stdout.write(css);
  if (argv.includes("--dark-first")) process.stdout.write(`:root { color-scheme: dark; } /* dark by default; [data-theme="light"] opts in */\n`);
} else if (argv[0] !== "--imported") {
  console.log("Usage: node palette.mjs --hue <0-360> --accent <0-360> [--accent-chroma 0.19] [--tint 0.012] [--on-accent auto|light|dark] [--dark-first]\n       node palette.mjs --test");
}
