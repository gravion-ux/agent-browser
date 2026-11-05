# Gravion Agent Browser - repository manifest

Version: 0.4.3
Repository: https://github.com/gravion-ux/agent-browser
Published: 2026-11-05

## Contents

- `src/`: CLI entry point, hostname allow-list policy, network destination checks and challenge detection
- `test/`: policy, network, challenge and browser runtime smoke tests
- `package.json`: npm package manifest (Playwright pinned to 1.64.1)
- `package-lock.json`: committed dependency lockfile
- `docs/`: shared toolkit documentation
- `scripts/`: secret scanner, static syntax gate, smoke commands and a one-command test runner
- `.github/workflows/ci.yml`: Node 20/22 tests, Chromium runtime smoke, advisory audit, static checks and a secret scan

## Security

No API keys, cookies, browser profiles or captured site data are included. The
browser refuses private, loopback, link-local and non-public destinations
unless the operator explicitly opts in.

See `docs/PUBLICATION-VERIFICATION.md` for the verified checks and the explicit
environment limitations.
