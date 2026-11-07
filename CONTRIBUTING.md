# Contributing

1. Fork, branch, and open a pull request against `main`. Direct pushes are blocked.
2. CI must pass: `node .github/lint-skill.mjs`, the script self-tests, and `audit.sh`.
   Run them locally first (see `.github/workflows/ci.yml`).
3. Keep `SKILL.md` under 400 lines and each `references/` file under 150.
4. Changes to `scripts/` must not add dependencies, network calls, or writes outside
   the paths the user passes in. These scripts run on other people's machines.
5. If you change behavior, add a line to `CHANGELOG.md`.

Security issues: see `SECURITY.md`, not the issue tracker.
