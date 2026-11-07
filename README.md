# ahmed-ui-craft

A Claude Code skill by **Ahmed Butt** that makes Claude build distinctive,
production-grade, accessible frontend UI instead of the generic "AI look"
(Inter, purple gradients, three identical rounded cards, emoji icons).

It makes Claude:

1. **Think first**: purpose, audience, tone, and one memorable differentiator.
2. **Commit to a direction**: editorial, brutalist, soft/organic, industrial, luxury, playful, or Swiss minimal, applied to type, color, shape, and motion.
3. **Define tokens before components**: color, type, spacing, radius, shadow, motion, z-index. No magic numbers.
4. **Build mobile-first with every state**: hover, focus-visible, active, disabled, loading, error, empty.
5. **Audit before delivering**: grep checks plus a WCAG 2.2 AA, responsive, performance, and security checklist.

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
│   └── anti-patterns.md        # the generic AI look itemized, with fixes
├── assets/tokens.css           # starter tokens, light + dark, contrast-checked
└── scripts/
    ├── audit.md                # pre-delivery checklist with grep commands
    └── contrast.mjs            # WCAG contrast for #hex / oklch() pairs
evals/                          # test prompts, outputs with and without the skill, results
```

Claude reads `SKILL.md` when the skill triggers and opens reference files only
when the task needs them, so it stays light on context.

## Evaluation

See [`evals/RESULTS.md`](evals/RESULTS.md) for three prompts run with and without
the skill, what improved, and what was changed afterwards. Re-score the outputs with
`bash evals/score.sh`.

## License

MIT, see [LICENSE](LICENSE).
