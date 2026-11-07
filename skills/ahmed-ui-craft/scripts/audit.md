# Pre-delivery audit

Run this before you tell the user the UI is done. Fix every failure, or list it
explicitly in your reply with the reason. Part A is automatic; Part B needs judgment.

## Part A - grep checks

Set `T` to what you changed: a folder (`src`, `app`, `components`) or a single file.
Each command should print nothing; any output is a finding to fix or justify.
Works in bash, zsh, and Git Bash on Windows.

```bash
export LC_ALL=C.UTF-8   # grep -P needs a UTF-8 locale (Git Bash fails without it)
T=src                   # or T=index.html
G="grep -rnP --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist"

# 1. Hard-coded colors outside token declarations (lines declaring --custom-props are allowed)
$G "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(" $T | grep -vP -- "--[\w-]+\s*:[^;{}]*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()"

# 2. Default Tailwind palette and arbitrary px values (Tailwind projects)
$G "\b(bg|text|border|from|to|via|ring)-(slate|gray|zinc|neutral|indigo|violet|purple|blue)-\d{2,3}\b|\[\d+px\]" $T

# 3. Generic fonts as the primary face
$G "font-family:\s*['\"]?(Inter|Roboto|Arial|Helvetica|Poppins|Montserrat|Space Grotesk|DM Sans)\b|family=(Inter|Roboto|Poppins|Montserrat|Space\+Grotesk|DM\+Sans)\b|next/font/google.*\b(Inter|Roboto|Poppins)\b" $T

# 4. Focus removed -> each hit needs a visible replacement on the same element
#    (expected hit: the input pattern in components.md swaps outline for border + ring)
$G "outline:\s*(none|0)\b|\boutline-none\b" $T

# 5. transition: all
$G "transition:\s*all\b|\btransition-all\b" $T

# 6. Unsafe HTML sinks -> each hit: is the input trusted, or sanitized with DOMPurify?
$G "dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|v-html|\{@html" $T

# 7. Secrets in client code
$G "(NEXT_PUBLIC|VITE|PUBLIC)_\w*(SECRET|PRIVATE|PASSWORD)|sk_live_|sk_test_" $T

# 8. Images missing alt, or missing width/height
$G "<img(?![^>]*\balt=)" $T
$G "<img(?![^>]*\b(width|height|fill)\b)" $T

# 9. Emoji and dingbats used as icons (also catches content: "✓" in CSS)
$G "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" $T

# 10. Clickable non-buttons
$G "<(div|span|li)[^>]*\bon[cC]lick" $T

# 11. Something animates but nothing handles reduced motion (prints a warning if so)
$G -l "animation|transition|framer-motion|gsap" $T >/dev/null && ! $G -q "prefers-reduced-motion|useReducedMotion" $T && echo "MISSING prefers-reduced-motion"

# 12. target=_blank without rel
$G "target=[\"']_blank[\"'](?![^>]*\brel=)" $T
```

Then measure contrast in every theme. Do not copy ratios from comments; compute them.
`check-tokens.mjs` reads your tokens file (or the page with inline tokens), resolves
`var()` and `light-dark()`, and checks 15 semantic pairs per theme. It exits 1 on any failure:

```bash
node scripts/check-tokens.mjs styles/tokens.css        # or the .html file with inline tokens
node scripts/contrast.mjs "oklch(46% 0.016 60)" "#fbf8f3"   # one-off pair, e.g. a chart color
```

(Path is relative to this skill's folder. Accepts `#hex` and `oklch()`. Alpha is ignored:
for translucent colors, measure the solid color they blend to on their background.)

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
