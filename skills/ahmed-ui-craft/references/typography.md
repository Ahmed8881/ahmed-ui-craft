# Typography

Type carries most of the personality of an interface. Change the fonts and
nothing else, and a page moves from "template" to "designed".

## 1. Pick a pairing from the direction

Pair a **display** face (headings, big numbers) with a **body** face (paragraphs,
UI). Contrast them in structure, not just weight. All below are free (Google
Fonts or Fontshare).

| Direction | Display | Body | Mono (optional) |
|---|---|---|---|
| Editorial | Fraunces, Newsreader, Instrument Serif | Instrument Sans, Source Sans 3 | JetBrains Mono |
| Brutalist | Archivo Black, Anton | Archivo, Work Sans | Space Mono |
| Soft / organic | Bricolage Grotesque, Young Serif | Figtree, Nunito Sans | - |
| Industrial / technical | Barlow Condensed, Big Shoulders Display | IBM Plex Sans, Geist | IBM Plex Mono, Geist Mono |
| Luxury | Cormorant Garamond, Playfair Display | Manrope, Jost | - |
| Playful | Shrikhand, Chango, Bagel Fat One | Outfit, Lexend | - |
| Swiss minimal | Schibsted Grotesk, Hanken Grotesk | same family, different weight | Spline Sans Mono |

Avoid as the main face: Inter, Roboto, Arial, Helvetica, Open Sans, Lato,
Poppins, Montserrat, Space Grotesk, DM Sans. They are fine fonts; they are also
what every generated page uses, so they read as "no decision made". If the
project already uses one of them, keep it for body text and change only the display face.

Rules:
- Two families maximum, plus a mono for code or tabular numbers.
- Load only weights you use (usually 2-3). Each weight is a separate download.
- Prefer variable fonts: one file, every weight.

## 2. Type scale

Use a modular scale, not arbitrary sizes. Ratio 1.2-1.25 on mobile, 1.333-1.5 on
desktop. Make it fluid with `clamp(min, preferred, max)` so it scales between
breakpoints instead of jumping.

```css
:root {
  --text-base: 1rem;                                      /* never below 16px for body */
  --text-xl: clamp(1.25rem, 1.15rem + 0.45vw, 1.5rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.7vw, 2.875rem);
  --text-display: clamp(2.75rem, 1.5rem + 5.6vw, 6rem);   /* hero only */
}
```

How to compute a clamp: pick size at 360px (min) and at 1280px (max).
`slope = (max - min) / (1280 - 360)`; preferred = `min - slope*360` (in rem) `+ slope*100vw`.
Keep the `rem` part so text still scales with user zoom (WCAG 1.4.4).

Hierarchy must be obvious. A hero heading 3-6x the body size is normal for a
landing page; 2x is timid. Dashboards use smaller ratios (1.125-1.2) and lean on
weight and color for hierarchy instead.

## 3. Line height, measure, tracking

| Text | line-height | letter-spacing |
|---|---|---|
| Display (40px+) | 0.95-1.1 | -0.02em to -0.04em |
| Headings | 1.1-1.3 | -0.01em |
| Body | 1.5-1.7 | 0 |
| Small caps labels | 1.2 | +0.06em to +0.1em, uppercase |

```css
h1 { line-height: var(--leading-tight); letter-spacing: var(--tracking-tight); text-wrap: balance; }
p  { max-width: var(--measure); text-wrap: pretty; }          /* 60-75ch */
.eyebrow { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: var(--tracking-caps); }
.num { font-variant-numeric: tabular-nums; }                   /* prices, tables, counters */
```

Large display type needs tighter leading and tracking; body text at those
settings becomes unreadable. Do not reuse one line-height for both.

## 4. Load fonts without layout shift

Next.js (best: self-hosted, size-adjusted fallback generated automatically):

```tsx
// app/layout.tsx
import { Fraunces, Instrument_Sans } from "next/font/google";
const display = Fraunces({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
/* tokens.css: --font-display: var(--font-display-face), Georgia, serif; */
```

Plain HTML / Vite:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet" />
```

Or self-host with `@fontsource-variable/fraunces` and import it once.

Reduce the swap jump with a metric-matched fallback:

```css
@font-face {
  font-family: "Fraunces Fallback";
  src: local("Georgia");
  size-adjust: 104%;
  ascent-override: 92%;
}
:root { --font-display: "Fraunces", "Fraunces Fallback", Georgia, serif; }
```

## 5. Quick checks

- Body text is at least 16px and never set in the display face.
- No more than 2 families and 4 weights are downloaded.
- Numbers in tables and prices use `tabular-nums`.
- Headings use `text-wrap: balance`; no single-word last lines in the hero.
- Text resizes to 200% without clipping (test with browser zoom).
