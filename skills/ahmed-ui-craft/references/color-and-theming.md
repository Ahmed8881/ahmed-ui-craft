# Color and theming

A good palette has a clear hierarchy: neutrals do most of the work, one
dominant brand color sets the mood, one sharp accent points at what matters.

## 1. Build the palette in OKLCH

OKLCH (`oklch(L C H)`) has perceptually even lightness, so a 10-step ramp
actually looks evenly stepped, and two colors with the same L have similar
contrast against white. HSL does not do this (HSL yellow at 50% is much lighter than blue at 50%).

```css
/* Ramp: keep hue fixed, step lightness, peak chroma in the middle */
--clay-100: oklch(95% 0.03 45);
--clay-300: oklch(82% 0.08 45);
--clay-500: oklch(65% 0.14 45);
--clay-700: oklch(47% 0.12 45);
--clay-900: oklch(28% 0.06 45);
```

Steps:
1. Pick the **dominant hue** from the brand or the direction (editorial: ink + warm paper;
   industrial: graphite + amber; luxury: near-black + gold or emerald).
2. Make **neutrals tinted** toward that hue: chroma 0.005-0.02, same hue. Pure gray (`chroma 0`)
   looks dead next to a saturated accent.
3. Pick **one accent** that contrasts in hue (complementary or split-complementary) and is
   saturated (chroma 0.15+). Reserve it for the primary CTA, active states, and key data.
4. Status colors (success, warning, danger) are separate from the accent. Never use the
   brand red as the error red if users will confuse "important" with "broken".

## 2. Proportion: 60 / 30 / 10

- ~60% neutral background and surfaces
- ~30% dominant (text color, headers, large blocks, illustrations)
- ~10% accent (CTA, links, highlights)

If the accent appears on more than a few elements per screen, it stops meaning
"look here". Timid palettes (five pastel colors at equal weight) fail for the same
reason: nothing stands out.

Ways to be bold without being loud: a full-bleed dominant-color section, a giant
numeral in the accent, a dark hero over a light page. Pick one.

## 3. Semantic tokens

Components never reference raw colors. They reference roles:

| Token | Role |
|---|---|
| `--color-bg` | page background |
| `--color-surface`, `--color-surface-raised` | cards, panels, popovers |
| `--color-text`, `--color-text-muted` | primary and secondary text |
| `--color-border`, `--color-border-strong` | dividers; input and control outlines (3:1) |
| `--color-accent`, `--color-accent-hover`, `--color-on-accent` | primary action fill and its text |
| `--color-accent-text` | accent used as text (links) on bg, must pass 4.5:1 |
| `--color-inverse-surface`, `--color-on-inverse` | featured panel or dark band on a light page (flips in dark mode) |
| `--color-success`, `--color-warning`, `--color-danger` | status |
| `--color-focus` | focus ring |

```css
.btn-primary { background: var(--color-accent); color: var(--color-on-accent); }
.btn-primary:hover { background: var(--color-accent-hover); }
```

## 4. Dark mode

Dark mode is a second value for the same semantic tokens. It is not
`filter: invert()` and not "swap black and white". Write both values in one
declaration with `light-dark()` (supported in all major browsers since 2024):

```css
:root {
  color-scheme: light dark;                                   /* follow the OS; required by light-dark() */
  --color-bg: light-dark(oklch(98.5% 0.006 85), oklch(15% 0.01 60));   /* dark: tinted near-black, not #000 */
  --color-surface: light-dark(oklch(96% 0.01 85), oklch(20% 0.012 60)); /* dark: raise by lightening */
  --color-text: light-dark(oklch(20% 0.012 60), oklch(95% 0.01 85));    /* dark: off-white, pure white glares */
  --color-accent: light-dark(oklch(54% 0.19 33), oklch(70% 0.17 38));   /* dark: lighter, a bit less chroma */
}
:root[data-theme="light"] { color-scheme: light; }            /* explicit user choice wins */
:root[data-theme="dark"]  { color-scheme: dark; }
```

Why: with separate light and dark blocks, the dark values live 80 lines away
from the light ones and drift. One declaration per token keeps them reviewed together.
Older browsers need the fallback: a `:root[data-theme="dark"]` block that redefines the tokens.

Rules:
- Elevation in dark mode = lighter surface. Shadows are barely visible on dark backgrounds.
- Desaturate and lighten accents; light-mode accents vibrate on dark backgrounds.
- Dark-first product (monitoring, dev tools)? `:root { color-scheme: dark; }` as the default.
- Avoid a flash of the wrong theme: set `data-theme` in a tiny inline script in `<head>`
  before CSS paints, reading the user's saved choice.

```html
<script>
  try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch {}
</script>
```

## 5. Contrast (WCAG 2.2 AA)

| What | Minimum |
|---|---|
| Body text, labels, placeholder text you rely on | 4.5:1 |
| Large text (24px+, or 18.66px+ bold) | 3:1 |
| Input borders, icons that convey meaning, focus rings | 3:1 against adjacent colors |
| Disabled controls, pure decoration | no requirement (still keep text legible) |

Check every text/background pair you define, in both themes. Fast ways:
- Chrome DevTools: inspect element, click the color swatch, read "Contrast ratio".
- CLI: `npx wcag-contrast "#1f1a17" "#fbf8f3"` or any WCAG calculator.
- Write the ratio as a comment next to the token, as `assets/tokens.css` does.

Common failures and fixes:
- Muted gray text (`#999` on white is 2.8:1): use a darker step, e.g. `--ink-600`.
- Accent as text: the fill color that works for a button often fails as small text.
  Define a separate darker `--color-accent-text`.
- White text on yellow, lime, cyan, orange: use dark text on those (`--color-on-accent` dark).
- Text over images: add a scrim (`linear-gradient(to top, oklch(0% 0 0 / .6), transparent)`).

Never convey meaning by color alone (WCAG 1.4.1): pair red with an icon or text
("Error: ..."), and pair chart colors with labels or patterns.
