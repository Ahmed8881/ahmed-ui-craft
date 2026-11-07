# Pre-delivery audit

Run this before you tell the user the UI is done. Fix every failure, or list it
explicitly in your reply with the reason. Part A is automatic; Part B needs judgment.

## Part A - automated checks

Run from the skill folder (or give the full path to the script), pointing at what you changed:

```bash
bash scripts/audit.sh src                 # folder: html, css, js/ts, jsx/tsx, vue, svelte, astro, mdx
bash scripts/audit.sh dist/index.html     # or a single file
```

It prints each finding with file and line, and exits 1 if anything is found. Works in bash,
zsh, and Git Bash on Windows. Fix every finding, or justify it in your reply. After reviewing an
expected hit, skip that check with `AUDIT_ALLOW=focus-removed,html-sink bash scripts/audit.sh src`.

| ID | Flags |
|---|---|
| `hardcoded-color` | hex/rgb/hsl/oklch outside a `--custom-property` declaration |
| `tailwind-default` | `bg-indigo-500`-style default palette classes, `[13px]` arbitrary values |
| `generic-font` | Inter, Roboto, Arial, Helvetica, Poppins, Montserrat, Space Grotesk, DM Sans as a face |
| `focus-removed` | `outline: none` / `outline-none`. Expected for the input pattern in `components.md`, which swaps it for border + ring |
| `transition-all` | `transition: all`, `transition-all` |
| `html-sink` | `dangerouslySetInnerHTML`, `.innerHTML =`, `insertAdjacentHTML`, `v-html`, `{@html}` |
| `client-secret` | secret-looking public env vars, `sk_live_` / `sk_test_` keys |
| `img-alt`, `img-size` | `<img>` without `alt`, or without `width`/`height` |
| `emoji-icon` | emoji and dingbats (including `content: "✓"`) |
| `div-click` | `onClick` on `div`/`span`/`li` |
| `blank-rel` | `target="_blank"` without `rel` |
| `reduced-motion` | animation present but no `prefers-reduced-motion` / `useReducedMotion` |
| `contrast` | any file defining `--color-text` is measured with `check-tokens.mjs` (needs node) |

For colors not covered by tokens (chart series, illustrations), measure one-off pairs:

```bash
node scripts/contrast.mjs "oklch(46% 0.016 60)" "#fbf8f3"
node scripts/palette.mjs --hue 60 --accent 30     # failing palette? regenerate one that passes
```

Part A cannot see the rendered page. If a browser is available, also run `scripts/browser-check.mjs`
(see Part C).

## Part C - rendered checks (when a browser is available)

```bash
npm i -D playwright @axe-core/playwright && npx playwright install chromium   # once per project
node scripts/browser-check.mjs http://localhost:3000/pricing     # running dev server
node scripts/browser-check.mjs dist/index.html                   # or a built/static file
```

It loads the page at 320, 375, 768, 1024, and 1440px in light and dark and saves full-page
screenshots to `ui-check/`. It then checks horizontal overflow (naming the element that
causes it), touch targets under 44px, keyboard focus without a visible ring, layout shift
(CLS > 0.1), animations still running under reduced motion, and axe-core WCAG 2.2 A/AA rules.
Exits 1 on any failure.

**Look at the screenshots.** Read at least the 375px and 1440px images and check them against the
direction and differentiator from Step 1. Automated checks prove the page is usable, not that it is good.

## Part B - review checklist

**Direction and distinctiveness**
- [ ] I can state the direction and the differentiator in one line each, and both are visible on screen.
- [ ] Display and body fonts are a deliberate pairing; neither is a generic default.
- [ ] Palette has one dominant color and one accent; the accent appears only on key elements.
- [ ] Layout has at least one deliberate break from uniform repetition (featured item, asymmetry, scale contrast).
- [ ] No purple gradients, gradient text, emoji icons, or identical card triplets (unless the brand requires it).
- [ ] Copy is specific to the product; no "Lorem", "Feature 1", or "Unlock the power".

**Tokens**
- [ ] All colors, spacing, radius, shadows, durations, and z-indexes come from tokens.
- [ ] Dark mode (if in scope) changes only semantic tokens.

**States**
- [ ] Every interactive element has hover, focus-visible, active, and disabled styles.
- [ ] Async actions have loading states that do not change element size.
- [ ] Data views have loading, empty, and error states with a next action.
- [ ] Forms show errors in text, linked with `aria-describedby`, and focus the first invalid field.

**Accessibility**
- [ ] Text contrast at least 4.5:1 (3:1 large text and UI boundaries) in every theme. Ratios checked, not guessed.
- [ ] Full keyboard pass: Tab order matches visual order, focus always visible, Esc closes overlays.
- [ ] Semantic elements used; ARIA only where no native element exists.
- [ ] Touch targets at least 44x44px.

**Responsive**
- [ ] Checked at 320, 375, 768, 1024, 1440 widths. No horizontal scroll at any of them.
- [ ] Long words, URLs, and numbers wrap or truncate with a visible full value (title/tooltip).
- [ ] Hover-only affordances also appear on focus and touch.

**Performance**
- [ ] Images have width/height or aspect-ratio; below-fold images lazy-load; the hero image does not.
- [ ] Fonts: at most 2 families, only used weights, `display: swap`.
- [ ] Animations use only transform/opacity; `prefers-reduced-motion` respected.
- [ ] No large dependency added for something CSS can do.

**Security**
- [ ] No untrusted data reaches an HTML sink; any rich HTML is sanitized.
- [ ] No secrets in client bundles or public env vars.

## Report

End your reply with one line: `Audit: passed` or `Audit: passed with exceptions - <what and why>`.
