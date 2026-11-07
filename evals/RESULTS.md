# Eval results

Three prompts (see `prompts.md`). Each was run by a fresh Claude Sonnet agent once
without the skill (`runs/baseline/`) and once with it (`runs/with-skill/`). Both
produced a single self-contained HTML file. `score.sh` counts the signals below,
and the audit's Part A grep checks were run on all six files.

## Measured signals (v1 skill)

| Output | Generic font | Hard-coded colors* | `var(--)` uses | `:focus-visible` | Reduced motion | Emoji/dingbat icons | Audit Part A findings |
|---|---|---|---|---|---|---|---|
| baseline/pricing | Inter (body) | 0 | 19 | 1 | no | 1 (`✓`) | 2 |
| with-skill/pricing | none | 0 | 137 | 2 | yes | 0 | 0 |
| baseline/login | Inter | many (`#fff`, indigo `rgba(79,70,229)`) | 7 | 1 | no | 0 | 9 |
| with-skill/login | none | 0 | 73 | 3 | yes | 0 | 0 |
| baseline/dashboard | Inter | 0 | 10 | **0** | yes | 0 | 2, incl. `innerHTML` with template data |
| with-skill/dashboard | none | 0 | 106 | 1 | yes | 0 | 0 |

\* outside custom-property declarations.

## What improved with the skill

- **Typography**: every baseline used Inter. With the skill: Fraunces + Instrument Sans
  (pricing, login) and Barlow Condensed + IBM Plex Sans/Mono (dashboard).
- **A named direction and differentiator**: "editorial ledger" with dotted-leader rows
  under a giant numeral price, and "industrial instrument panel" with mono index numbers and a
  2x2 featured CPU tile. The baselines had no stated concept.
- **Layout variety**: the baseline dashboard was six equal auto-fit cards, and the baseline
  pricing page was three equal columns. With the skill, the dashboard had a featured tile spanning
  2x2 and pricing had an inverted, wider Studio tier.
- **States**: the baselines had almost none (0 matches for disabled, aria-busy, aria-invalid, or empty).
  The with-skill outputs had loading buttons with fixed width, `aria-invalid` + `aria-describedby`
  errors that focus the first invalid field, and an empty state for the alerts list.
- **Accessibility**: the baseline login removed the outline on `input:focus` and kept the indigo
  default. The baseline dashboard had no focus styles at all. The with-skill versions have
  `:focus-visible` everywhere, labels, 44px targets, `role="switch"` + a live region for the price toggle.
- **Security**: the baseline dashboard built its cards with `innerHTML` from data. No with-skill
  output used an HTML sink.
- **Tokens**: with the skill, outputs used 7-11x more token references and had zero stray colors.

## What was still generic or broken (v1)

1. **The starter tokens became the new default.** Two of the three with-skill outputs (pricing, login)
   shipped `tokens.css` unchanged: the same Fraunces + Instrument Sans + vermilion for two unrelated
   products. The skill had removed the AI look and put its own house style in its place.
2. **Audit greps didn't run as written.** They assumed a `src/` folder and bash brace globs,
   `grep -P` errored in Git Bash without a UTF-8 locale, and the `tokens.css` exclusion did not
   work when tokens were inlined. Agents adapted or skipped checks.
3. **Contrast was never measured.** Agents trusted the ratio comments in `tokens.css`.
4. **Missing token roles.** The pricing agent invented `--color-inverse-*` for its featured panel.
5. **Light-first tokens fought a dark-first dashboard**, and the 16px body rule conflicted with dense
   dashboard metadata.

## Refinements made

- `SKILL.md` step 3: starter values are a placeholder. The agent must replace the font pairing,
  accent hue, and neutral tint, and SKILL.md says why (the test above). Added guidance for
  dark-first directions and single-file deliverables, and a dense-UI exception for 12-14px metadata.
- `assets/tokens.css`: a "PLACEHOLDER VALUES" header and `--color-inverse-surface` / `--color-on-inverse`
  in all themes.
- `scripts/audit.md`: rewritten so it runs on any target (`T=src` or `T=file.html`), sets the UTF-8
  locale, allows colors only in custom-property declarations (inline or file), catches dingbats
  like `✓`, and requires measuring contrast.
- New `scripts/contrast.mjs`: WCAG ratio for `#hex` and `oklch()` pairs, with a `--test` self-check.
  Every token pair in `tokens.css` was measured with it (all pass AA in light and dark).

## Re-test (v2)

See the section below, added after re-running the login prompt with the refined skill.

### v2 login re-run (`runs/with-skill-v2/login.html`)

- **Default-look gap fixed**: the agent replaced the starter tokens. Swiss-minimal direction with
  Schibsted Grotesk + Hanken Grotesk + Spline Sans Mono, slate neutrals at hue 250, and a signal lime accent.
  It shares nothing visual with the v1 login or pricing outputs.
- **Contrast measured, not copied**: 16 pairs across both themes, from 3.14:1 (input border, UI-only
  requirement 3:1) to 18.84:1. All pass.
- **Audit Part A ran as written** on a single file. Its only hit was the intended
  `outline: none` on inputs, which the input pattern replaces with border + ring. The audit now
  marks that as an expected hit, and contrast.mjs documents that alpha is ignored.

**Still not covered by any run**: real browser rendering at 320-1440px, keyboard passes, and screen
reader checks. The agents had no browser, so Part B was reviewed by reading the code only.

## v1.1: rendered checks on the same outputs

`scripts/browser-check.mjs` (Playwright + axe-core, 5 widths x 2 themes) on the eval pages:

| Page | Result |
|---|---|
| baseline/login | FAIL: "Forgot password?" link is 19px tall (touch target) |
| with-skill/pricing | all checks passed |
| with-skill/dashboard | FAIL: axe `label-content-name-mismatch`. The three "Ack" buttons have an `aria-label` that does not contain their visible text, which breaks voice control ("click Ack") |
| with-skill-v2/login | all checks passed |

Neither failure is visible to grep. That is why the rendered check is now Part C of the audit.
The run also found a bug in browser-check itself: it served only the page's folder, so
`../tokens.css` 404'd on the preset preview. Fixed before release, and covered by CI.
