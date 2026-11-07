# Anti-patterns

The "AI-generated" look is a specific, recognizable set of defaults. Each one is
harmless alone; together they say nobody made a decision. Check your output
against this list before you start and again before you finish.

## Visual clichés

| Anti-pattern | Why it hurts | Do instead |
|---|---|---|
| Inter / Roboto / Poppins / Space Grotesk everywhere | The default of every generator and template | Display + body pairing from `typography.md` |
| Purple-to-blue gradient hero, purple on white | The most recognizable generated-page signature | Palette derived from brand or direction; flat color or a subtle tinted surface |
| Gradient text on the headline | Low contrast, hard to read, overused | Solid color; emphasize with weight, italic, or the accent on one word |
| Three identical feature cards with icon + title + 2 lines | Zero hierarchy; reader can't tell what matters | Featured item, numbered list, asymmetric split (`layout-and-spacing.md` 4) |
| `rounded-2xl` / 24px radius on everything | Bubbly, toy-like, ignores direction | Radius from tokens; controls small, containers at most `--radius-lg` |
| Emoji as icons (rocket, lightning, sparkles) | Render differently per OS, can't take token colors, read aloud by screen readers | One SVG icon set, one stroke width, `aria-hidden="true"` |
| Glassmorphism blur cards over a gradient blob | Low contrast, expensive to render, dated | Solid surfaces; if translucent, ensure 4.5:1 on the worst background |
| Drop shadow + border + gradient on the same card | Three depth cues fighting | Pick one: border, or shadow, or tonal surface |
| Everything centered | No reading edge, weak hierarchy | Left-align body and most headings; center only short hero text |
| Pure gray neutrals with a neon accent | Looks unfinished, cold | Neutrals tinted toward the brand hue |
| Huge hero, then tiny 14px body | Broken hierarchy below the fold | Consistent modular scale, body 16px+ |
| Fake testimonials and stats ("10,000+ happy users") | Untrue content ships to production by accident | Realistic placeholders clearly marked, or real data |
| "Lorem ipsum", "Feature 1", "John Doe" | Hides layout problems, looks like a template | Specific copy that fits the purpose |

## Copy clichés

Avoid: "Unlock the power of", "Revolutionize your workflow", "Seamless",
"Elevate", "Supercharge", "Built for the future", "All-in-one platform".
Write what the product does for whom: "Close the books in two days, not ten."

## Code anti-patterns

```css
/* 1. Magic numbers */
.card { padding: 22px; color: #6b7280; border-radius: 14px; }   /* bad */
.card { padding: var(--space-5); color: var(--color-text-muted); border-radius: var(--radius-md); } /* good */

/* 2. Removing focus */
button:focus { outline: none; }                     /* bad: keyboard users are lost */
button:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

/* 3. Animating everything */
* { transition: all 0.3s ease; }                    /* bad: animates layout, flickers on theme change */
.btn { transition: background-color var(--dur-fast) var(--ease-out); }

/* 4. Fixed widths and heights */
.hero { width: 1200px; height: 600px; }             /* bad: horizontal scroll, clipped text */
.hero { width: min(100%, var(--container-max)); min-height: 60svh; }

/* 5. Hover-only affordances */
.row .actions { display: none; } .row:hover .actions { display: flex; }  /* bad: invisible on touch and keyboard */
.row .actions { opacity: 0.6; } .row:is(:hover, :focus-within) .actions { opacity: 1; }
```

```tsx
// 6. Div buttons
<div onClick={save} className="btn">Save</div>                 // bad: no keyboard, no role
<button type="button" onClick={save} className="btn">Save</button>

// 7. Unsafe HTML
<div dangerouslySetInnerHTML={{ __html: comment.body }} />      // bad: XSS
<p>{comment.body}</p>                                           // good: React escapes text
// If rich text is required:
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.html) }} />

// 8. Secrets in the client
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY); // bad: shipped to every visitor
// Secret keys live on the server (route handler, server action); the client gets a publishable key only.

// 9. Images without dimensions
<img src={src} />                                              // bad: layout shift, no alt
<img src={src} alt="Dashboard showing weekly revenue" width={1200} height={750} loading="lazy" decoding="async" />

// 10. Placeholder as label
<input placeholder="Email" />                                  // bad: label disappears on typing
<label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" />
```

Same for other frameworks: Vue `v-html` and Svelte `{@html}` are as dangerous as
`dangerouslySetInnerHTML`; `el.innerHTML = userText` should be `el.textContent = userText`.

## Process anti-patterns

- **Coding before deciding.** Writing components before tokens produces drift: five grays, four radii.
- **Mixing directions.** Brutalist borders with soft pastel gradients and luxury serif headings.
- **Restyling an established brand.** If the project has a design system, extend it; don't replace it.
- **Desktop-first.** Designing at 1440px and squeezing down produces horizontal scroll and crushed tables.
- **Only the happy path.** No loading, empty, or error state means the UI breaks the first time real data is slow or missing.
- **Skipping the audit.** "Looks fine" in one browser at one size is not done. Run `scripts/audit.md`.
