#!/usr/bin/env node
// Renders a page in a real browser and checks what grep cannot: overflow, touch targets,
// visible focus, reduced motion, layout shift, and axe-core WCAG rules. Saves screenshots.
//
// Setup (once, in the project):  npm i -D playwright @axe-core/playwright && npx playwright install chromium
// Usage: node browser-check.mjs <url | path/to/page.html> [--out ui-check] [--widths 320,375,768,1024,1440]
// Exits 1 if any check fails. Without Playwright installed it explains how and exits 2.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve, basename } from "node:path";

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const target = argv.find((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
if (!target) { console.log("Usage: node browser-check.mjs <url | page.html> [--out ui-check] [--widths 320,375,768,1024,1440]"); process.exit(2); }
const OUT = resolve(opt("out", "ui-check"));
const WIDTHS = opt("widths", "320,375,768,1024,1440").split(",").map(Number);

// Resolve Playwright from the project being checked, not from where this skill is installed
const req = createRequire(join(process.cwd(), "noop.js"));
const load = (name) => { try { return req(name); } catch { return null; } };
const pw = load("playwright") ?? load("@playwright/test");
if (!pw) {
  console.log("Playwright not found in this project. Install it, then re-run:\n  npm i -D playwright @axe-core/playwright && npx playwright install chromium");
  process.exit(2);
}
const AxeBuilder = load("@axe-core/playwright")?.default ?? load("@axe-core/playwright")?.AxeBuilder;

// Local files are served over http so fetch(), modules, and relative URLs behave like production
let server, url = target;
if (!/^https?:\/\//.test(target)) {
  const file = resolve(target);
  if (!existsSync(file)) { console.error(`Not found: ${file}`); process.exit(2); }
  const root = statSync(file).isDirectory() ? file : dirname(file);
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json" };
  server = createServer((q, r) => {
    const p = join(root, decodeURIComponent(q.url.split("?")[0]));
    if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) { r.statusCode = 404; return r.end(); }
    r.setHeader("content-type", types[extname(p)] ?? "application/octet-stream");
    r.end(readFileSync(p));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  url = `http://127.0.0.1:${server.address().port}/${statSync(file).isDirectory() ? "" : basename(file)}`;
}

async function launch() {
  for (const opts of [{}, { channel: "chrome" }, { channel: "msedge" }]) {
    try { return await pw.chromium.launch(opts); } catch { /* try the next installed browser */ }
  }
  console.error("No Chromium found. Run: npx playwright install chromium"); process.exit(2);
}

const browser = await launch();
// One context per page: axe-core needs pages created from a context
const open = async (opts) => (await browser.newContext(opts)).newPage();
const close = (p) => p.context().close();
mkdirSync(OUT, { recursive: true });
const failures = [];
const fail = (check, detail) => failures.push({ check, detail });

// 1. Overflow + screenshots at every width, light and dark
for (const scheme of ["light", "dark"]) {
  for (const width of WIDTHS) {
    const page = await open({ viewport: { width, height: 900 }, colorScheme: scheme });
    await page.goto(url, { waitUntil: "networkidle" });
    const wide = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= vw) return [];
      const name = (e) => e.tagName.toLowerCase() + (e.id ? `#${e.id}` : "") + (e.classList.length ? `.${[...e.classList].join(".")}` : "");
      return [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > vw + 1)
        .filter((e) => !e.parentElement || e.parentElement.getBoundingClientRect().right <= vw + 1).slice(0, 5).map(name);
    });
    if (wide.length) fail("overflow", `${width}px ${scheme}: horizontal scroll caused by ${wide.join(", ")}`);
    await page.screenshot({ path: join(OUT, `${width}-${scheme}.png`), fullPage: true });
    await close(page);
  }
}

const page = await open({ viewport: { width: 375, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });

// 2. Touch targets (WCAG 2.5.8 minimum is 24px; this skill requires 44px). Inline links in text are exempt.
const small = await page.evaluate(() => [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=switch], [role=tab], [tabindex='0']")]
  .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; })
  .filter((e) => !(e.tagName === "A" && e.closest("p, li") && getComputedStyle(e).display === "inline"))
  .filter((e) => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; })
  .slice(0, 10).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} "${(e.innerText || e.getAttribute("aria-label") || e.name || "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`; }));
if (small.length) fail("touch-target", `under 44x44px at 375px: ${small.join("; ")}`);

// 3. Visible focus: Tab through the page and compare each element's focused vs unfocused styles
await page.setViewportSize({ width: 1024, height: 900 });
const noRing = [];
for (let i = 0; i < 40; i++) {
  await page.keyboard.press("Tab");
  const r = await page.evaluate(() => {
    const e = document.activeElement;
    if (!e || e === document.body) return null;
    const s = getComputedStyle(e);
    const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
    return { id: e.tagName.toLowerCase() + ((e.innerText || e.getAttribute("aria-label") || "").trim() ? ` "${(e.innerText || e.getAttribute("aria-label")).trim().slice(0, 30)}"` : ""), ring };
  });
  if (!r) break;
  if (!r.ring && !noRing.includes(r.id)) noRing.push(r.id);
}
if (noRing.length) fail("focus-visible", `no outline or ring when focused by keyboard: ${noRing.slice(0, 8).join("; ")}`);

// 4. Layout shift during load
const cls = await page.evaluate(() => new Promise((ok) => {
  let total = 0;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) total += e.value; }).observe({ type: "layout-shift", buffered: true });
  setTimeout(() => ok(total), 500);
}));
if (cls > 0.1) fail("layout-shift", `CLS ${cls.toFixed(3)} (keep under 0.1: set image dimensions, reserve space, metric-matched font fallbacks)`);
await close(page);

// 5. Reduced motion: nothing should still be moving
const calm = await open({ viewport: { width: 1024, height: 900 }, reducedMotion: "reduce" });
await calm.goto(url, { waitUntil: "networkidle" });
const moving = await calm.evaluate(() => document.getAnimations()
  .filter((a) => a.playState === "running" && (a.effect?.getComputedTiming().duration ?? 0) > 50)
  .slice(0, 5).map((a) => a.effect?.target?.tagName?.toLowerCase() + " " + (a.animationName ?? a.transitionProperty ?? "")));
if (moving.length) fail("reduced-motion", `still animating with prefers-reduced-motion: reduce: ${moving.join("; ")}`);

// 6. axe-core WCAG 2.2 A/AA rules
let axeNote = "";
if (AxeBuilder) {
  for (const scheme of ["light", "dark"]) {
    await calm.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    const res = await new AxeBuilder({ page: calm }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    for (const v of res.violations) fail(`axe:${v.id}`, `${scheme}: ${v.help} (${v.impact}, ${v.nodes.length} element(s)) e.g. ${v.nodes[0]?.target.join(" ")}`);
  }
} else axeNote = "axe-core skipped: npm i -D @axe-core/playwright for WCAG rule checks";
await close(calm);

await browser.close();
server?.close();

writeFileSync(join(OUT, "report.json"), JSON.stringify({ url, widths: WIDTHS, cls, failures }, null, 2));
console.log(`Checked ${url}\nScreenshots and report.json in ${OUT}`);
if (axeNote) console.log(axeNote);
for (const f of failures) console.log(`FAIL [${f.check}] ${f.detail}`);
console.log(failures.length ? `\nbrowser-check: ${failures.length} failure(s)` : "\nbrowser-check: all checks passed");
process.exit(failures.length ? 1 : 0);
