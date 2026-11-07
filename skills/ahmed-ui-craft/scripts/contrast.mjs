#!/usr/bin/env node
// WCAG 2.x contrast ratio for two colors. Accepts #rgb, #rrggbb, or oklch(L% C H).
// Usage: node contrast.mjs "#1f1a17" "oklch(98.5% 0.006 85)"
//        node contrast.mjs --test
import { pathToFileURL } from "node:url";

const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

// OKLCH -> linear sRGB, unclamped (values outside 0..1 mean out of gamut)
export function oklchToLinear(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const q = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * q,
  ];
}

function toLinearRgb(input) {
  const s = input.trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  }
  const ok = s.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.%]+\s*)?\)$/);
  if (ok) {
    // shortcut: clamps out-of-gamut instead of gamut-mapping; palette.mjs keeps colors in gamut
    return oklchToLinear(ok[2] ? ok[1] / 100 : +ok[1], +ok[3], +ok[4]).map((x) => Math.min(1, Math.max(0, x)));
  }
  throw new Error(`Unsupported color "${input}". Use #hex or oklch(L% C H).`);
}

export function contrast(a, b) {
  const Y = (c) => { const [r, g, bl] = toLinearRgb(c); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const [hi, lo] = [Y(a), Y(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
const args = isMain ? process.argv.slice(2) : null;
if (!args) {
  // imported as a module: no CLI
} else if (args[0] === "--test") {
  const near = (x, y) => Math.abs(x - y) < 0.05;
  console.assert(near(contrast("#000", "#fff"), 21), "black/white = 21");
  console.assert(near(contrast("#777", "#fff"), 4.48), "#777/white = 4.48");
  console.assert(near(contrast("oklch(100% 0 0)", "#000000"), 21), "oklch white = 21");
  console.log("ok");
} else if (args.length === 2) {
  const r = contrast(args[0], args[1]);
  const verdict = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large text / UI only" : "FAIL";
  console.log(`${r.toFixed(2)}:1  ${verdict}`);
} else {
  console.log('Usage: node contrast.mjs "<foreground>" "<background>"');
}
