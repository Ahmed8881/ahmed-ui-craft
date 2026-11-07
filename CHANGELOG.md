# Changelog

## 1.2.0 - 2026-11-07

### Added
- Multi-agent mode in `SKILL.md`: 2-3 parallel subagents propose distinct directions for
  open-ended briefs, and a fresh subagent reviews every new page and ranks findings
  blocker / major / minor before delivery. Falls back to doing both passes alone.

## 1.1.0 - 2026-11-07

### Added
- Seven direction presets in `assets/directions/` (editorial, brutalist, soft/organic, industrial,
  luxury, playful, Swiss minimal), `references/directions.md` with signature moves, and `preview.html`.
- `scripts/palette.mjs`: AA-passing light + dark palette from two hues, with gamut fitting and
  vivid accents that start from each hue's chroma cusp.
- `scripts/check-tokens.mjs`: measures every semantic pair in both themes from CSS or HTML.
- `scripts/audit.sh`: the audit's pattern checks as one runnable command with labeled findings and exit codes.
- `scripts/browser-check.mjs`: rendered checks (overflow, touch targets, focus, CLS, reduced motion,
  axe-core) and screenshots at 5 widths x 2 themes.
- `references/frameworks.md`: Next.js + Tailwind v4, shadcn/ui, MUI, Nuxt, SvelteKit, Astro.
- GitHub Actions CI.

### Changed
- `tokens.css` uses `light-dark()`, one declaration per color instead of duplicated dark blocks.
- Audit has a Part C (rendered checks) and tells Claude to look at the screenshots.

## 1.0.0 - 2026-11-07

- First release: workflow, seven references, starter tokens, audit checklist, contrast checker, evals.
