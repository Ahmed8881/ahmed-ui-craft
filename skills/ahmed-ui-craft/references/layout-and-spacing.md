# Layout and spacing

Generic layouts come from centering everything and repeating one card. Good
layouts come from a consistent spacing rhythm and deliberate variation in size.

## 1. Spacing scale

4px base, non-linear steps (see `assets/tokens.css`): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
Every padding, margin, and gap uses a step. Never `padding: 13px` or `gap: 22px`.

Rules of thumb:
- **Proximity**: space inside a group < space between groups. Label-to-input 8px,
  field-to-field 16-24px, section-to-section 64-128px.
- Use `gap` on flex/grid instead of margins on children. Margins collapse and leak.
- Section padding is fluid: `padding-block: var(--space-section)`.

```css
.stack { display: flex; flex-direction: column; gap: var(--space-4); }
.stack-lg { gap: var(--space-7); }
.cluster { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-3); align-items: center; }
```

## 2. Containers

```css
.container {
  width: min(100% - 2 * var(--gutter), var(--container-max));
  margin-inline: auto;
}
.prose { max-width: var(--measure); } /* text never spans 1400px */

/* Full-bleed child inside a centered container */
.bleed { width: 100vw; margin-inline: calc(50% - 50vw); }
```

Note: `100vw` includes the scrollbar on Windows; only use `.bleed` with `overflow-x: clip` on `body`.

## 3. Breakpoints (mobile-first)

Write base styles for ~360px, then add `min-width` queries. Common points:

| Name | min-width | Typical change |
|---|---|---|
| sm | 40rem (640px) | 2 columns for cards, inline form rows |
| md | 48rem (768px) | sidebar appears, nav expands |
| lg | 64rem (1024px) | 3-column grids, larger type |
| xl | 80rem (1280px) | max container width reached |

Prefer **container queries** for components, so a card responds to its slot, not the window:

```css
.card-slot { container-type: inline-size; }
@container (min-width: 28rem) {
  .card { grid-template-columns: 10rem 1fr; }
}
```

## 4. Grids that are not identical cards

Responsive grid without media queries:

```css
.grid { display: grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); }
```

The `min(100%, 18rem)` part stops overflow on screens narrower than 18rem.

Break the uniformity on purpose. Pick one:

```css
/* Featured item: first card spans two columns and two rows */
@media (min-width: 64rem) {
  .grid-featured { grid-template-columns: repeat(3, 1fr); }
  .grid-featured > :first-child { grid-column: span 2; grid-row: span 2; }
}

/* Asymmetric split: text column + larger visual */
.split { display: grid; gap: var(--space-6); }
@media (min-width: 48rem) { .split { grid-template-columns: 5fr 7fr; align-items: center; } }

/* Editorial: content on a 12-col grid, offset start */
@media (min-width: 64rem) {
  .editorial { display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-5); }
  .editorial > h2 { grid-column: 1 / 5; }
  .editorial > .body { grid-column: 6 / 12; }
}
```

Other ways out of the card grid: a numbered list with large indices; a table
for comparison content; alternating rows (text left, visual right, then swapped);
one big statement followed by small supporting facts.

## 5. Preventing horizontal scroll

The page must not scroll sideways at 320px. Usual causes and fixes:

```css
.flex-child, .grid-child { min-width: 0; }           /* flex/grid items default to min-width: auto */
.long-text { overflow-wrap: anywhere; }              /* URLs, emails, hashes */
.table-wrap { overflow-x: auto; }                    /* wide tables scroll inside their box */
img, video, iframe { max-width: 100%; height: auto; }
pre { overflow-x: auto; }
```

Fixed widths (`width: 600px`) become `max-width` or `min()`. To find the
offender: DevTools console `[...document.querySelectorAll('*')].filter(e => e.scrollWidth > document.documentElement.clientWidth)`.

## 6. Alignment and density

- Align to edges, not just centers. Left-aligned text with a strong left edge reads
  better than everything centered; reserve centering for short hero text.
- Dashboards: denser (8-16px gaps, smaller type) but the same scale.
  Marketing pages: airy (48-128px between sections).
- Sticky headers: keep them short (56-64px) and add `scroll-padding-top` so
  anchored headings and focused elements are not hidden under them (WCAG 2.4.11).

```css
html { scroll-padding-top: calc(4rem + var(--space-4)); }
```

## 7. Touch targets

Interactive elements are at least 44x44px. Small visual icons can keep a large hit area:

```css
.icon-btn { min-width: var(--tap-min); min-height: var(--tap-min); display: inline-grid; place-items: center; }
```

Leave at least 8px between adjacent targets so taps do not land on the neighbor.
