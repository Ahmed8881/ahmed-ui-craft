# Framework recipes

How to wire tokens, fonts, theming, and motion into each stack. Read the section for the
project's framework after Step 0. The design rules are the same everywhere; only the plumbing changes.

## Next.js (App Router) + Tailwind v4

```css
/* app/globals.css */
@import "tailwindcss";
@import "../styles/tokens.css";          /* block 2 of tokens.css changed from :root to @theme */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

```tsx
// app/layout.tsx
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display-face" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-body-face" });

const noFlash = `try{const t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch{}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: noFlash }} /></head>  {/* static string, not user data */}
      <body>{children}</body>
    </html>
  );
}
```

In tokens: `--font-display: var(--font-display-face), "Arial Narrow", sans-serif;`.
`next/font` self-hosts and generates a size-adjusted fallback, so fonts cause no layout shift.

- Images: `next/image` with `width`/`height` (or `fill` + `sizes`); `priority` only on the LCP image.
- Server Components by default; add `"use client"` only to the interactive leaf (toggle, dialog).
- Secrets stay in server code (Route Handlers, Server Actions). `NEXT_PUBLIC_*` is shipped to every visitor.

## shadcn/ui

shadcn components read their own variables. Point them at your tokens in `globals.css`, and
replace shadcn's `.dark { ... }` block, since `light-dark()` in your tokens already covers dark mode:

```css
:root {
  --background: var(--color-bg);            --foreground: var(--color-text);
  --card: var(--color-surface);             --card-foreground: var(--color-text);
  --popover: var(--color-surface-raised);   --popover-foreground: var(--color-text);
  --primary: var(--color-accent);           --primary-foreground: var(--color-on-accent);
  --secondary: var(--color-surface);        --secondary-foreground: var(--color-text);
  --muted: var(--color-surface);            --muted-foreground: var(--color-text-muted);
  --accent: var(--color-surface);           --accent-foreground: var(--color-text);
  --destructive: var(--color-danger);
  --border: var(--color-border);            --input: var(--color-border-strong);
  --ring: var(--color-focus);               --radius: var(--radius-md);
}
.dark { color-scheme: dark; }   /* next-themes toggles this class */
.light { color-scheme: light; }
```

Keep shadcn's `@theme inline { --color-background: var(--background); ... }`. Its names differ from
yours, so there is no cycle. Restyle by editing `components/ui/*` directly (it is your code), not by
wrapping. Common edits: radius per direction, `button.tsx` sizes (default `h-9` is 36px, so raise to `h-11` for
44px targets), and focus rings (`focus-visible:ring-2 ring-ring ring-offset-2`).

## MUI (v6+)

MUI computes hover and disabled shades from palette values, so give it literal colors, not `var()`:

```ts
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "[data-theme='%s']" },   // same attribute as tokens.css
  colorSchemes: {
    light: { palette: { primary: { main: "#2f5bd3", contrastText: "#fff" }, background: { default: "#fbf9f4" } } },
    dark: { palette: { primary: { main: "#7ea2ff", contrastText: "#0d1117" }, background: { default: "#14161a" } } },
  },
  typography: { fontFamily: "var(--font-body)", h1: { fontFamily: "var(--font-display)" } },
  shape: { borderRadius: 4 },
});
```

Convert `palette.mjs` output to hex (DevTools color picker, or `oklch.com`), then run
`check-tokens.mjs` on your own token file to keep CSS and MUI in sync.

## Vue / Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({ css: ["~/assets/css/tokens.css"], modules: ["@nuxt/fonts"] });
```

- `@nuxt/fonts` self-hosts any `font-family` it sees in your CSS. For plain Vite + Vue, use `@fontsource-variable/*`.
- Never `v-html` untrusted content. If needed: `v-html="DOMPurify.sanitize(html)"`.
- `<Transition>` respects reduced motion only if your CSS does: put the `prefers-reduced-motion` reset in tokens.css (it is there).
- `useColorMode()` from `@nuxtjs/color-mode` with `dataValue: "theme"` sets `data-theme` for you.

## SvelteKit

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import "$lib/styles/tokens.css";
  import { prefersReducedMotion } from "svelte/motion";   // Svelte 5.7+
  let { children } = $props();
</script>
{@render children()}
```

- `svelte/transition` animations run in JS and ignore CSS media queries. Pass `duration: prefersReducedMotion.current ? 0 : 220`.
- `{@html}` is as dangerous as `innerHTML`; sanitize or render as text.
- Put the no-flash theme script in `src/app.html` `<head>`.

## Astro

- Import `tokens.css` in the base layout's frontmatter; scoped `<style>` blocks use the tokens freely.
- Ship zero JS by default; hydrate only interactive islands (`client:visible` for below-the-fold widgets).
- `<Image />` from `astro:assets` sets dimensions and lazy-loads for you.
- Fonts: `@fontsource-variable/<name>` imports, or Astro's font configuration if the project uses it.

## Plain HTML

`<link rel="stylesheet" href="styles/tokens.css">` first, then a preset from `assets/directions/`, then
`main.css`. Put the no-flash script inline in `<head>` before the stylesheets.

## Checks after wiring

```bash
bash scripts/audit.sh src            # or app/, components/, pages/
node scripts/check-tokens.mjs app/globals.css
node scripts/browser-check.mjs http://localhost:3000
```
