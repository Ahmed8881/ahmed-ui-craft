# ahmed-ui-craft

[![ci](https://github.com/Ahmed8881/ahmed-ui-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/Ahmed8881/ahmed-ui-craft/actions/workflows/ci.yml)

A Claude Code skill by **Ahmed Butt** that makes Claude build distinctive,
production-grade, accessible frontend UI instead of the generic "AI look"
(Inter, purple gradients, three identical rounded cards, emoji icons).

It makes Claude:

1. **Think first**: purpose, audience, tone, and one memorable differentiator.
2. **Commit to a direction**: seven ready presets (editorial, brutalist, soft/organic, industrial, luxury, playful, Swiss minimal), each with fonts, a contrast-checked palette, shape, motion, and signature moves.
3. **Define tokens before components**: one `light-dark()` declaration per color, so light and dark never drift. Any brand hue becomes an AA-passing palette in one command.
4. **Build mobile-first with every state**: hover, focus-visible, active, disabled, loading, error, empty.
5. **Prove it before delivering**: a pattern audit, measured contrast in both themes, and a real-browser check with screenshots, overflow, touch targets, focus, layout shift, reduced motion, and axe-core.

## Tools it gives Claude (and you)

All are plain Node or bash with no dependencies, except the browser check, which uses the project's Playwright.

| Command | What it does |
|---|---|
| `node scripts/palette.mjs --hue 250 --accent 130` | Generates all 17 semantic colors for light + dark, solved to pass WCAG AA by construction |
| `node scripts/check-tokens.mjs tokens.css` | Measures 15 text/background pairs per theme from any tokens file or HTML page; exits 1 on failure |
| `bash scripts/audit.sh src` | 13 pattern checks (stray colors, generic fonts, removed focus, HTML sinks, secrets, emoji icons...) plus contrast |
| `node scripts/browser-check.mjs http://localhost:3000` | 5 widths x 2 themes: screenshots, overflow culprits, <44px targets, invisible focus, CLS, reduced motion, axe-core |
| `node scripts/contrast.mjs "#1f1a17" "oklch(98% 0.01 85)"` | One-off WCAG ratio for `#hex` or `oklch()` |

Open `assets/directions/preview.html` over http (`npx serve skills/ahmed-ui-craft/assets`) to compare the seven presets in light and dark.

Works with React/Next.js, Vue, Svelte, and plain HTML/CSS; Tailwind (v3 and v4),
CSS Modules, or vanilla CSS. If your project already has a design system
(shadcn/ui, MUI, your own tokens), the skill extends it instead of replacing it.

## Install

### As a plugin (recommended)

Inside Claude Code:

```
/plugin marketplace add Ahmed8881/ahmed-ui-craft
/plugin install ahmed-ui-craft@ahmed-ui-craft
```

Restart Claude Code if the skill does not show up right away. Update later with
`/plugin marketplace update ahmed-ui-craft`.

### Manually, as a personal skill (all your projects)

```bash
git clone https://github.com/Ahmed8881/ahmed-ui-craft.git
mkdir -p ~/.claude/skills
cp -r ahmed-ui-craft/skills/ahmed-ui-craft ~/.claude/skills/
```

### Manually, as a project skill (shared with your team via git)

```bash
mkdir -p .claude/skills
cp -r path/to/ahmed-ui-craft/skills/ahmed-ui-craft .claude/skills/
```

## Use

You usually don't need to do anything. The skill triggers on its own for UI
work: "build a pricing page", "restyle this form", "make the dashboard look
better", "add dark mode", "create design tokens", "polish this component".

To invoke it explicitly:

```
/ahmed-ui-craft build a settings page for a team billing dashboard
```

(When installed as a plugin, the command may appear as `/ahmed-ui-craft:ahmed-ui-craft`.)

Steer it by naming a direction or a reference: "brutalist", "editorial like a
newspaper", "match our existing tokens in `globals.css`".

## What's inside

```
skills/ahmed-ui-craft/
├── SKILL.md                    # workflow and quality rules
├── references/
│   ├── typography.md           # font pairings, type scale, fluid type, font loading
│   ├── color-and-theming.md    # OKLCH palettes, semantic tokens, dark mode, contrast
│   ├── layout-and-spacing.md   # spacing scale, non-uniform grids, breakpoints, overflow
│   ├── motion.md               # easing, durations, micro-interactions, reduced motion
│   ├── accessibility.md        # WCAG 2.2 AA checklist, focus, ARIA, keyboard
│   ├── components.md           # buttons, inputs, cards, modals, tables with all states
│   ├── anti-patterns.md        # the generic AI look itemized, with fixes
│   ├── directions.md           # the seven presets: when to use, signature moves, what to avoid
│   └── frameworks.md           # Next.js + Tailwind v4, shadcn/ui, MUI, Nuxt, SvelteKit, Astro
├── assets/
│   ├── tokens.css              # starter tokens, light-dark(), contrast-checked
│   └── directions/             # 7 preset .css files + preview.html
└── scripts/
    ├── audit.md                # pre-delivery checklist (parts A, B, C)
    ├── audit.sh                # automated pattern + contrast checks
    ├── browser-check.mjs       # rendered checks with Playwright + axe-core
    ├── check-tokens.mjs        # contrast for every semantic token pair, both themes
    ├── palette.mjs             # AA-safe palette generator
    └── contrast.mjs            # one-off WCAG contrast
evals/                          # test prompts, outputs with and without the skill, results
```

Claude reads `SKILL.md` when the skill triggers and opens reference files only
when the task needs them, so it stays light on context.

## Evaluation

See [`evals/RESULTS.md`](evals/RESULTS.md) for three prompts run with and without
the skill, what improved, and what was changed afterwards. Re-score the outputs with
`bash evals/score.sh`.

CI runs on every push: manifest and structure lint, script self-tests (including 360 generated
palettes), contrast for the starter tokens and all presets, the audit in both directions, and a
browser check of the preset preview.

## License

MIT, see [LICENSE](LICENSE).
