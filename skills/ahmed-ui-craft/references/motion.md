# Motion

Motion should explain what happened (this opened, that was saved, this moved
there), not decorate. One well-timed page-load sequence beats twenty hover wiggles.

## 1. Tokens

```css
:root {
  --dur-instant: 80ms;   /* color change on press */
  --dur-fast: 150ms;     /* hover, focus, toggles */
  --dur-base: 220ms;     /* dropdowns, tooltips, small panels */
  --dur-slow: 360ms;     /* modals, drawers, page sections entering */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* entering: fast start, soft landing */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* moving between two on-screen positions */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);/* playful overshoot, use rarely */
}
```

Which easing:
- Elements **entering**: `--ease-out`. Elements **leaving**: `ease-in`, and ~30% shorter.
- Never `linear` for UI movement (fine for spinners and progress bars).
- Match the direction: brutalist = near-instant; luxury = slow, long ease; playful = spring.

## 2. What to animate

Only `transform` and `opacity` (and occasionally `filter`, `clip-path`). They run
on the compositor. Animating `width`, `height`, `top`, `left`, `margin`, or
`box-shadow` triggers layout or paint every frame and janks on low-end phones.

```css
/* bad */  .card:hover { margin-top: -4px; box-shadow: 0 20px 40px #0003; transition: all .3s; }
/* good */
.card { position: relative; transition: transform var(--dur-fast) var(--ease-out); }
.card::after {                      /* pre-rendered shadow, fade it in */
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  box-shadow: var(--shadow-lg); opacity: 0; transition: opacity var(--dur-fast) var(--ease-out);
}
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }
  .card:hover::after { opacity: 1; }
}
```

Never `transition: all`: it animates properties you did not intend (including
layout ones) and makes theme switches flicker.

## 3. Micro-interactions

```css
/* Press feedback */
.btn { transition: background-color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out); }
.btn:active:not(:disabled) { transform: translateY(1px); }

/* Accordion open/close without animating height: grid trick */
.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-base) var(--ease-out); }
.panel[data-open="true"] { grid-template-rows: 1fr; }
.panel > .inner { overflow: hidden; }

/* Dialog entrance */
dialog[open] { animation: dialog-in var(--dur-slow) var(--ease-out); }
@keyframes dialog-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } }
dialog::backdrop { background: oklch(15% 0.01 60 / 0.5); }
```

(The grid-rows trick does animate layout, but on one element at a time it is acceptable
and avoids measuring heights in JS.)

## 4. Page-load and scroll reveals

One orchestrated entrance on load is memorable; animating every block on every
scroll is tiring. Stagger with a custom property:

```css
.reveal { animation: rise var(--dur-slow) var(--ease-out) both; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes rise { from { opacity: 0; transform: translateY(12px); } }
```

```html
<h1 class="reveal" style="--i: 0">...</h1>
<p class="reveal" style="--i: 1">...</p>
<a class="reveal btn" style="--i: 2">...</a>
```

Keep total stagger under ~500ms; users should never wait for content to appear.
Do not hide content with `opacity: 0` until JS runs: if JS fails, the page is blank.

For scroll-linked effects, prefer CSS `animation-timeline: view()` behind
`@supports`, or IntersectionObserver. Never listen to `scroll` and set styles per event.

## 5. Reduced motion (required)

Users with vestibular disorders set `prefers-reduced-motion: reduce`. Movement,
parallax, and zooms can make them physically ill.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In JS (Framer Motion, GSAP, scroll libraries):

```tsx
import { useReducedMotion, motion } from "framer-motion";
const reduce = useReducedMotion();
<motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} />
```

```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
```

Also: anything that auto-plays or moves for more than 5 seconds (carousels,
marquees, background video) needs a visible pause control (WCAG 2.2.2).

## 6. Loading motion

- Spinners for actions under ~2s; skeletons for content areas.
- Skeleton shimmer uses `transform` on a pseudo-element, not `background-position`.
- Keep loading UI the same size as the final content so nothing shifts when it arrives.

```css
.skeleton { position: relative; overflow: hidden; background: var(--color-surface); border-radius: var(--radius-sm); }
.skeleton::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, oklch(100% 0 0 / 0.4), transparent);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { transform: translateX(100%); } }
```
