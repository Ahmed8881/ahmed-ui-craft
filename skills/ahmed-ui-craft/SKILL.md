---
name: ahmed-ui-craft
description: Builds distinctive, production-grade, accessible frontend UI that does not look AI-generated. Use this skill whenever the task produces or changes anything a person sees in a browser - building or restyling a component, page, landing page, pricing page, dashboard, form, login or signup screen, settings panel, navbar, modal, table, email-style HTML, design system, theme, or design tokens - and for any "make it look better / polish / modernize / clean up / make it pop" request, even if the user never says "design" or "UI". Also use it when reviewing frontend code for visual quality, responsiveness, or accessibility. Works with React/Next.js, Vue, Svelte, and plain HTML/CSS, styled with Tailwind, CSS Modules, or vanilla CSS.
---

# Ahmed UI Craft

Language models drift toward the statistical average of the web: Inter, a purple
gradient, three identical rounded cards, an emoji per feature. That output is
recognizable at a glance and tells the user nobody made a decision. This skill
forces the decisions to be made, written down as tokens, and checked before you
hand anything over.

Follow the workflow in order. Each step exists because skipping it is how
generic UI happens.

## Step 0 - Read the project before you design

Look before you invent. Check, in this order:

1. **Framework**: `package.json` (next, react, vue, svelte, astro), or plain `.html`.
2. **Styling**: `tailwind.config.*` or `@import "tailwindcss"` / `@theme` (Tailwind v4),
   `*.module.css`, styled-components, or plain CSS.
3. **Existing tokens**: grep for `--color-`, `--space-`, `@theme`, `theme.extend`.
4. **Component library**: `components/ui/` + `components.json` (shadcn/ui),
   `@mui/material`, Radix, Headless UI, Vuetify.

Why: a beautiful component that ignores the project's existing tokens and
library is a regression, not an improvement. If the project already has a
design system, work inside it: extend its tokens, restyle its primitives
(for shadcn/ui, edit the CSS variables in `globals.css` and the component
files, do not wrap them). Only bring in `assets/tokens.css` when there is no
system to extend.

If nothing exists, default to: semantic HTML + CSS custom properties from
`assets/tokens.css`, mapped into Tailwind if Tailwind is present.

## Step 1 - Design thinking (before any code)

Write four short lines, in your head or in the reply:

- **Purpose**: what job does this screen do? (e.g. "convince a team lead to start a trial")
- **Audience**: who is looking, on what device, in what mood? (e.g. "ops engineers, desktop, scanning fast")
- **Tone**: three adjectives. (e.g. "exact, calm, dense")
- **Differentiator**: one thing someone would remember after closing the tab.

The differentiator must be concrete and visible, not "clean and modern".
Good ones: "prices set in a huge condensed numeral that runs edge to edge";
"every card has a hairline rule and a mono index number like a spec sheet";
"the hero headline is set in a serif italic over an off-white paper texture".

Why: if you cannot name the differentiator, the output will be the average,
because the average is what the model produces when nothing pulls it away.

If the user gave a brand, screenshot, or existing site, the tone comes from
that. Do not impose a new direction on an established brand.

## Step 2 - Commit to one aesthetic direction

Pick one direction and apply it everywhere: type, color, radius, shadow,
motion, imagery, and copy rhythm. Mixed directions read as indecision.

| Direction | Type | Color | Shape and depth | Motion |
|---|---|---|---|---|
| Editorial | Serif display, humanist body | Paper off-white, ink, one strong accent | Hairline rules, near-zero radius, no shadows | Slow fades, none on scroll |
| Brutalist | Heavy grotesk or mono, huge sizes | Raw black/white + one loud color | 0 radius, thick borders, hard offset shadows | Instant, snappy |
| Soft / organic | Rounded or soft serif display | Warm tinted neutrals, muted earthy accent | Large radius on containers only, diffuse shadows | Springy, gentle |
| Industrial / technical | Condensed or grotesk + mono | Dark neutral, signal accent (amber, lime, cyan) | Small radius, 1px borders, grid lines visible | Fast, linear-ish |
| Luxury | High-contrast serif, wide tracking caps | Near-black, cream, metallic or deep jewel accent | Generous whitespace, thin borders | Slow, long eases |
| Playful | Chunky display, friendly sans | Two saturated colors that clash on purpose | Sticker shapes, offset shadows | Bouncy overshoot |

Rules for the choice:
- Derive it from Step 1, not from habit. A dashboard for SREs is not "luxury".
- Name it in your reply ("Direction: industrial / technical") so the user can redirect early.
- If the user asks for something bland ("simple, clean"), still choose: "Swiss minimal"
  is a direction (strict grid, one grotesk, black + one color, zero decoration).

## Step 3 - Define tokens first

Before you write a single component, define tokens for: color, type, spacing,
radius, shadow, motion, z-index. Start from `assets/tokens.css`: keep the names,
replace the values.

The starter values (Fraunces + Instrument Sans, paper neutrals, vermilion accent)
are a placeholder, not a style. Before writing components, change at least the
font pairing (from `references/typography.md`, matched to your direction), the
accent hue, and the hue the neutrals are tinted toward. Why: in testing, unchanged
starter tokens made a login form and a pricing page for unrelated products look
identical. That is a new default, which is the problem this skill exists to fix.
Keep them only if the direction really is warm editorial with a red-orange accent.

For dark-first directions (monitoring dashboards, developer tools, luxury night
themes), set `:root { color-scheme: dark; }` so dark is the default and light is opt-in.

Why: tokens make the direction enforceable. A hard-coded `#6366f1` or `13px`
in a component is a decision made in isolation, and twenty of those make the
UI drift. With tokens, dark mode, theming, and later restyles are one-file changes.

Rules:
- **Two layers**: raw palette (`--ink-900`, `--clay-500`) and semantic tokens
  (`--color-text`, `--color-accent`, `--color-surface`). Components use only semantic tokens.
- **No magic numbers in components**. Every color, size, gap, radius, shadow,
  duration, and z-index comes from a token. Exceptions: `0`, `1px` hairlines, `100%`, and `1fr`.
- **Dark mode**: every semantic color is `light-dark(LIGHT, DARK)`, so both themes live in one
  declaration and components never change. See `references/color-and-theming.md`.

**Tailwind**: make the tokens the theme, so `bg-surface`, `text-text-muted`,
`font-display`, and `rounded-md` exist and `bg-indigo-500` does not.

- **v4**: the second block in `assets/tokens.css` already uses Tailwind's namespaces
  (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*`).
  Change that block's `:root` to `@theme` and add `--color-*: initial;` as its first
  line to drop the default palette. Keep block 3 (`color-scheme`) as plain CSS. Utilities
  resolve `light-dark()` per theme, because they reference `var(--color-*)`.
  Do not write `@theme inline { --color-x: var(--color-x) }`; a variable that
  references its own name is a cycle and resolves to nothing.
- **v3**: in `tailwind.config`, set `theme.colors` (not `extend`) to
  `{ surface: "var(--color-surface)", ... }` and extend `fontFamily`, `borderRadius`, `boxShadow` the same way.

## Step 4 - Build mobile-first, with every state

Write base styles for a 360px viewport, then add `min-width` media or
container queries. Why: it is easier to add space than to take it away, and
most layout bugs (horizontal scroll, crushed tables) only show at small widths.

Every interactive element ships with all of its states. Missing states are the
most common reason a UI feels unfinished.

| State | What it must show |
|---|---|
| default | the resting design |
| hover | subtle change (color or shadow), only under `@media (hover: hover)` |
| focus-visible | a clearly visible ring, never removed |
| active | pressed feedback (darker, or `translateY(1px)`) |
| disabled | lower contrast + `cursor: not-allowed`, and the real `disabled` attribute |
| loading | spinner or skeleton, `aria-busy="true"`, width does not jump |
| error | message text near the field, not only a red border |
| empty | a real message and a next action, never a blank box |

Use semantic HTML first: `<button>` for actions, `<a href>` for navigation,
`<label for>` for every input, `<dialog>` for modals, `<table>` for tabular
data, landmarks (`<header> <nav> <main> <footer>`). Add ARIA only when HTML has
no native equivalent. Why: native elements come with keyboard behavior and
screen-reader semantics for free; ARIA is a promise you then have to implement.

Write real copy. Placeholder text ("Lorem ipsum", "Feature 1", "John Doe")
hides layout problems and makes the result look like a template. Use specific,
plausible content that fits the purpose from Step 1.

## Step 5 - Audit before delivering

Run every item in `scripts/audit.md`, including its grep commands and the
contrast measurement (`scripts/check-tokens.mjs`), and fix what fails. Ratios written
in comments are claims, not measurements; compute them. Do not report the work as done with known failures; if something cannot
be fixed (for example, a brand color that fails contrast), say so explicitly.

## Quality rules (and why)

**Typography**
- Do not default to Inter, Roboto, Arial, Helvetica, or system-ui for display text.
  Also avoid the newer AI defaults: Poppins, Montserrat, Space Grotesk, DM Sans.
  Why: these are what every generated page uses, so they signal "generated".
- Pair a display face with a body face that contrasts in structure (serif + sans,
  condensed + wide, grotesk + mono). Two families maximum, plus an optional mono.
- Use a modular scale with fluid sizes (`clamp()`), and make the largest heading
  dramatically larger than body text. Timid hierarchy (32px over 16px) looks unfinished.
- Body text: 16px minimum, line-height 1.5-1.7, measure 60-75ch. Dense dashboards
  may use 12-14px for metadata and table cells, never for paragraphs or inputs.

**Color**
- One dominant color carries the brand; one sharp accent is reserved for the
  primary action and key data. Neutrals do most of the work. Roughly 60/30/10.
  Why: an evenly distributed five-color palette has no focal point, so nothing reads as important.
- Tint your neutrals toward the brand hue instead of using pure gray.
- No purple-to-blue or purple-on-white gradients unless the brand truly is purple.
- Text contrast at least 4.5:1 (3:1 for 24px+ or 18.66px+ bold text, and for UI component boundaries and focus rings).

**Layout and shape**
- Avoid the identical three- or four-card grid. Vary size and emphasis: one featured
  item spanning two columns, a list beside a large visual, an asymmetric split.
- Radius follows the direction and is consistent per level. Do not put `rounded-2xl`
  on everything; small controls get small radius, or none.
- No horizontal scroll at 320px. Use `min-width: 0` on flex/grid children, `overflow-wrap: anywhere` for long strings, and scroll containers for wide tables.
- Touch targets at least 44x44px (padding counts).

**Icons and imagery**
- No emoji as icons. Use one icon set (Lucide, Phosphor, Heroicons, Tabler) at one stroke width,
  or inline SVG. Why: emoji render differently per OS, cannot be colored with tokens,
  and are announced by screen readers ("rocket").
- Decorative icons get `aria-hidden="true"`; icon-only buttons get an `aria-label`.

**Motion**
- Animate only `transform` and `opacity` (plus `filter` sparingly). Why: other properties
  trigger layout or paint on every frame and stutter on low-end phones.
- Durations from tokens: 120-200ms for UI feedback, 250-400ms for entering elements.
- Respect `prefers-reduced-motion`: remove movement, keep fades short or instant.

**Accessibility**
- Every focusable element has a visible `:focus-visible` style. Never `outline: none` without a replacement.
- Everything works with keyboard only: Tab order follows visual order, Escape closes overlays, focus returns to the trigger.
- Images have `alt` (empty `alt=""` when decorative). Form errors are linked with `aria-describedby`.

**Performance**
- Prevent layout shift: set `width`/`height` or `aspect-ratio` on images and media,
  reserve space for async content, use `font-display: swap` with a metric-matched fallback.
- Lazy-load below-the-fold images (`loading="lazy" decoding="async"`); never lazy-load the hero/LCP image.
- No `transition: all`. Load only the font weights you use.

**Security**
- Never pass untrusted data to `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
  `dangerouslySetInnerHTML`, Vue `v-html`, or Svelte `{@html}`. Render as text. If rich HTML
  from users is truly required, sanitize it with DOMPurify first, and say so in the reply.
- Never put secrets (API keys with write access, tokens, private URLs) in client code or
  `NEXT_PUBLIC_*` / `VITE_*` variables; everything shipped to the browser is public.
- External links opened with `target="_blank"` get `rel="noopener noreferrer"`.

## References - read when relevant

Read only the files the task needs. Each is short and code-first.

- `references/typography.md` - picking fonts, building the type scale, fluid sizes, font loading without layout shift.
- `references/color-and-theming.md` - building a palette in OKLCH, semantic tokens, dark mode, checking contrast.
- `references/layout-and-spacing.md` - spacing scale, grids that are not identical cards, breakpoints, containers, overflow fixes.
- `references/motion.md` - easing and duration tokens, micro-interactions, reduced motion, what is safe to animate.
- `references/accessibility.md` - WCAG 2.2 AA checklist, focus styles, ARIA patterns, keyboard support. Read for any interactive component.
- `references/components.md` - buttons, inputs, cards, modals, tables with every state written out.
- `references/anti-patterns.md` - the generic-AI look itemized, with the fix for each. Read before you start and again before you finish.
- `assets/tokens.css` - starter tokens with light and dark themes. Copy, then change values to match the direction.
- `scripts/audit.md` - the pre-delivery checklist. Always run it.
- `scripts/check-tokens.mjs` - `node scripts/check-tokens.mjs <tokens.css>` measures every semantic text/background pair in light and dark. Run it whenever you change color tokens.
- `scripts/contrast.mjs` - `node scripts/contrast.mjs "<fg>" "<bg>"` prints the WCAG ratio for one `#hex` or `oklch()` pair.

## Output format

**Files**
- Put tokens in one file: `styles/tokens.css` (or the project's existing tokens/globals file). Import it once at the root.
- One component per file, named for what it is: `PricingTable.tsx`, `pricing-table.vue`,
  `PricingTable.svelte`. Co-locate styles as `PricingTable.module.css` when using CSS Modules.
- Plain HTML: `index.html` + `styles/tokens.css` + `styles/main.css`.
- Single-file deliverables (demos, prototypes, "one HTML file" requests): one `<style>`
  block that starts with the token layer, then the components. The audit's color
  check allows hex/oklch only on lines declaring `--custom-properties`.
- Follow the project's existing naming and folder conventions over these defaults.

**Reply** - after the code, give a short design rationale (5-8 lines, not an essay):

```
Direction: Industrial / technical - the audience is SREs scanning dashboards.
Type: Barlow Condensed (display) + IBM Plex Sans (body) + IBM Plex Mono (numbers).
Color: graphite neutrals, signal amber accent only on alerts and the primary action.
Differentiator: mono index numbers and hairline grid lines, like an instrument panel.
States: all buttons and inputs have hover, focus-visible, active, disabled, loading, error.
Audit: passed; note - brand amber on white is 2.9:1, so amber text uses --amber-700 instead.
```

Why: the rationale lets the user disagree with a decision in one message instead
of reverse-engineering it from the CSS.
