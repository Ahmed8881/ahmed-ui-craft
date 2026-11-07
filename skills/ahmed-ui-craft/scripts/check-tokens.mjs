#!/usr/bin/env node
// Measures WCAG contrast for every semantic token pair in a CSS file, in light and dark.
// Resolves var() chains and light-dark(). Exits 1 if any pair fails.
// Usage: node check-tokens.mjs assets/tokens.css [more.css ...]
//        node check-tokens.mjs --test
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { contrast } from "./contrast.mjs";

// [foreground, background, minimum ratio, why]
const PAIRS = [
  ["--color-text", "--color-bg", 4.5, "body text"],
  ["--color-text", "--color-surface", 4.5, "text on cards"],
  ["--color-text", "--color-surface-raised", 4.5, "text in inputs/popovers"],
  ["--color-text-muted", "--color-bg", 4.5, "secondary text"],
  ["--color-text-muted", "--color-surface", 4.5, "secondary text on cards"],
  ["--color-on-accent", "--color-accent", 4.5, "primary button label"],
  ["--color-on-accent", "--color-accent-hover", 4.5, "primary button label, hover"],
  ["--color-accent-text", "--color-bg", 4.5, "links"],
  ["--color-on-inverse", "--color-inverse-surface", 4.5, "text on inverse panel"],
  ["--color-success", "--color-bg", 4.5, "success text"],
  ["--color-warning", "--color-bg", 4.5, "warning text"],
  ["--color-danger", "--color-bg", 4.5, "error text"],
  ["--color-border-strong", "--color-bg", 3, "input borders (UI component)"],
  ["--color-border-strong", "--color-surface-raised", 3, "input border on input fill"],
  ["--color-focus", "--color-bg", 3, "focus ring"],
];

export function parseTokens(css) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const decls = (body) => [...body.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g)];
  // Base theme = declarations in plain :root / html / @theme blocks; later ones win, like the cascade.
  // Dark overrides ([data-theme], media queries) are skipped: dark values come from light-dark().
  const tokens = {};
  for (const [, selector, body] of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    if (/^(:root|html|@theme(\s+inline)?)$/.test(selector.trim())) {
      for (const m of decls(body + ";")) tokens[m[1]] = m[2].trim();
    }
  }
  if (!Object.keys(tokens).length) for (const m of decls(noComments)) tokens[m[1]] ??= m[2].trim();
  return tokens;
}

// Split "a, b" at the top-level comma (ignores commas inside parentheses)
function splitTop(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
  }
  return [s.trim()];
}

export function resolve(tokens, value, theme, seen = new Set()) {
  value = value.trim();
  const ld = value.match(/^light-dark\(([\s\S]*)\)$/);
  if (ld) {
    const [light, dark] = splitTop(ld[1]);
    return resolve(tokens, theme === "dark" ? dark : light, theme, seen);
  }
  const v = value.match(/^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/);
  if (v) {
    if (seen.has(v[1])) throw new Error(`cycle at ${v[1]}`);
    if (v[1] in tokens) return resolve(tokens, tokens[v[1]], theme, new Set([...seen, v[1]]));
    if (v[2]) return resolve(tokens, v[2], theme, seen);
    throw new Error(`undefined ${v[1]}`);
  }
  return value;
}

export function check(css) {
  const tokens = parseTokens(css);
  const rows = [];
  for (const theme of ["light", "dark"]) {
    for (const [fg, bg, min, why] of PAIRS) {
      if (!(fg in tokens) || !(bg in tokens)) continue;
      const a = resolve(tokens, tokens[fg], theme), b = resolve(tokens, tokens[bg], theme);
      const ratio = contrast(a, b);
      rows.push({ theme, fg, bg, ratio, min, why, ok: ratio >= min });
    }
  }
  return rows;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
const args = isMain ? process.argv.slice(2) : [null];
if (!isMain) {
  // imported as a module: no CLI
} else if (args[0] === "--test") {
  const css = `:root{--x:#000;--y:#fff;--color-text:light-dark(var(--x),var(--y));--color-bg:light-dark(var(--y), #000)}`;
  const r = check(css);
  console.assert(r.length === 2 && r.every((x) => Math.abs(x.ratio - 21) < 0.01), "light-dark resolves per theme");
  console.assert(check(`:root{--color-text:#777;--color-bg:#fff}`)[0].ok === false, "#777 on white fails 4.5");
  const over = `:root{--color-text:#777;--color-bg:#fff} :root[data-theme="dark"]{--color-text:#fff} :root{--color-text:#000}`;
  console.assert(check(over).every((x) => Math.abs(x.ratio - 21) < 0.01), "later :root wins, dark override block ignored");
  console.log("ok");
} else if (args.length) {
  let failed = 0;
  for (const file of args) {
    const rows = check(readFileSync(file, "utf8"));
    console.log(`\n${file}`);
    for (const r of rows) {
      if (!r.ok) failed++;
      console.log(`  ${r.ok ? "pass" : "FAIL"}  ${r.theme.padEnd(5)} ${r.ratio.toFixed(2).padStart(5)}:1 (min ${r.min})  ${r.fg} on ${r.bg}  - ${r.why}`);
    }
    if (!rows.length) console.log("  no --color-* semantic pairs found");
  }
  console.log(failed ? `\n${failed} pair(s) below WCAG AA` : "\nAll pairs pass WCAG AA");
  process.exit(failed ? 1 : 0);
} else {
  console.log("Usage: node check-tokens.mjs <tokens.css> [...]   |   --test");
}
