# Direction presets

Seven starting points in `assets/directions/*.css`. Each sets fonts, a contrast-checked
palette (light + dark), radius, shadow, border width, and motion. Tokens alone are not a
direction, though: each preset below also lists its **signature moves**. Use at least two,
or the result is just a recolored template.

Use a preset: load it after `tokens.css`, add its font `<link>` (in the file header), then shift
its hues toward the brand with the `palette.mjs` command in the same header. Preview them all
in `assets/directions/preview.html` (serve the folder over http, e.g. `npx serve assets`).

Every accent here shares a hue family with nothing in the status colors, except Swiss red and
soft terracotta. In those two, error states must carry an icon and the word "Error", never color alone.

## Editorial - `editorial.css`
Newsreader + Source Sans 3. Warm paper, ink, ink-blue links. No shadows, near-zero radius.
For: publications, long-form marketing, reports, portfolios, "serious" B2B.

```css
.dek { font: italic var(--text-xl) / 1.4 var(--font-display); color: var(--color-text-muted); }
.rule { border-top: 1px solid var(--color-text); padding-top: var(--space-2); }   /* hairline above sections */
.dropcap::first-letter { float: left; font: 700 4.2em / 0.8 var(--font-display); margin: 0.05em 0.08em 0 0; }
.columns { columns: 2 22rem; column-gap: var(--space-7); column-rule: 1px solid var(--color-border); }
```
Moves: italic dek under the headline, hairline rules instead of cards, multi-column text, figure captions in small caps.
Avoid: drop shadows, pill buttons, icon grids.

## Brutalist - `brutalist.css`
Archivo Black + Archivo + Space Mono. Grayscale + acid yellow. 3px borders, hard offset shadows, 0 radius, stepped motion.
For: dev tools with attitude, agencies, events, zines, launch pages that must be remembered.

```css
.slab { border: var(--border-width) solid var(--color-text); box-shadow: var(--shadow-md); }
.slab:active { transform: translate(3px, 3px); box-shadow: var(--shadow-sm); }      /* button "presses" into its shadow */
.mega { font: var(--text-display) / var(--leading-tight) var(--font-display); text-transform: uppercase; overflow-wrap: anywhere; }
.marquee-label { background: var(--color-accent); color: var(--color-on-accent); padding: 0 var(--space-2); }
```
Moves: uppercase mega type that nearly fills the width, visible grid borders, highlighter-style labels, raw mono metadata.
Avoid: gradients, blur, soft shadows, rounded anything.

## Soft / organic - `soft-organic.css`
Bricolage Grotesque + Figtree. Warm tinted neutrals, terracotta. Large radius on containers, diffuse shadows, springy ease.
For: wellness, food, consumer apps, community products, onboarding.

```css
.blob { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; background: var(--color-surface); }
.pill-tag { border-radius: var(--radius-full); padding: var(--space-1) var(--space-3); background: var(--color-surface); }
.card { border-radius: var(--radius-lg); box-shadow: var(--shadow-md); border: 0; }
```
Moves: one organic blob shape behind the hero image, generous padding, mixed-weight headline, photography with warm tones.
Avoid: hard 1px grids, mono type, neon colors. Keep small controls at `--radius-sm`, not pill-shaped everything.

## Industrial / technical - `industrial.css` (dark-first)
Barlow Condensed + IBM Plex Sans + IBM Plex Mono. Graphite + signal cyan. 1px rules, 2-4px radius, fast motion.
For: dashboards, monitoring, infra, data tools, developer platforms.

```css
.panel { border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.index { font: var(--text-xs) var(--font-mono); letter-spacing: var(--tracking-caps); color: var(--color-text-muted); }
.reading { font: 500 var(--text-4xl) / 1 var(--font-display); font-variant-numeric: tabular-nums; }
.grid-bg { background-image: linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px); background-size: var(--space-6) var(--space-6); }
```
Moves: mono index numbers (01, 02...), condensed numerals for readings, visible grid lines, units in mono beside values.
Avoid: big radius, decorative illustration, color on anything that is not a status or the one primary action.

## Luxury - `luxury.css` (dark-first)
Cormorant Garamond + Manrope. Near-black, cream, deep emerald. No radius, almost no shadows, slow long eases.
For: premium goods, hospitality, real estate, private banking, fashion.

```css
.caps { font: 600 var(--text-xs) var(--font-body); letter-spacing: var(--tracking-caps); text-transform: uppercase; }
.display-italic { font: italic 500 var(--text-display) / 1 var(--font-display); }
.frame { border: 1px solid var(--color-border); padding: var(--space-7); }
.section { padding-block: var(--space-10); }                        /* whitespace is the luxury */
```
Moves: widely tracked small caps, italic serif display, huge whitespace, thin frames, slow fade-ins.
Avoid: badges, bright colors, dense layouts, bouncy motion, more than one CTA per screen.

## Playful - `playful.css`
Bagel Fat One + Outfit. Cream neutrals, hot pink. Chunky 2px borders, offset shadows, springy overshoot.
For: consumer apps, education, games, creator tools, kids' products.

```css
.sticker { border: var(--border-width) solid var(--color-text); box-shadow: var(--shadow-md); border-radius: var(--radius-md); rotate: -2deg; }
@media (hover: hover) { .sticker:hover { rotate: 0deg; translate: 0 -2px; } }
.wobble { transition: rotate var(--dur-base) var(--ease-out), translate var(--dur-base) var(--ease-out); }
.highlight { background: linear-gradient(transparent 60%, var(--color-accent) 60%); }   /* marker underline */
```
Moves: slightly rotated stickers, marker-underline highlights, chunky display type, bouncy (but reduced-motion-safe) hovers.
Avoid: thin type, gray-on-gray, corporate stock photos. Rotation stays at 1-3deg; more reads as broken.

## Swiss minimal - `swiss.css`
Hanken Grotesk only (+ Spline Sans Mono). Near-white, black, Swiss red. 0 radius, no shadows.
For: portfolios, architecture, design studios, product pages that should feel precise.

```css
.swiss-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-5); }
.flush-left { text-align: start; hyphens: auto; }
.headline { font: 800 var(--text-display) / var(--leading-tight) var(--font-display); letter-spacing: var(--tracking-tight); }
.red-square { inline-size: var(--space-5); aspect-ratio: 1; background: var(--color-accent); }
```
Moves: strict 12-column grid with asymmetric placement, one red element per screen, giant tight headline, flush-left everything.
Avoid: centered text, decoration, more than one typeface family, any shadow.

## Beyond the presets

Mix only along one axis: an editorial layout with industrial mono metadata works; editorial
type with playful stickers does not. When the brand dictates colors, keep the preset's
fonts, shape, and motion, and regenerate only the colors with `palette.mjs`.
