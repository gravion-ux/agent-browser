# Development setup

## Prerequisites
- Node.js 20+ and npm
- Playwright 1.64.1 and Chromium for the browser runtime smoke test

## Install and test

```bash
npm ci
npx playwright install chromium
npm test
npm run smoke:runtime
```

## One-command runner

```bash
bash scripts/test-all.sh
```

This runs the unit suite, the static syntax gate and the credential scan.

## Static checks only

```bash
python scripts/syntax-checks.py .
python scripts/scan-secrets.py .
```

## Code quality expectations
- Keep every network exposure explicit and documented.
- Add tests for argument validation, security policy and failure handling.
- Never commit API keys, cookies, browser profiles or captured site data.
- Keep safety-critical operations in narrow modules with dry-run and rollback paths.
- Update `MANIFEST.md`, `docs/` and `CHANGELOG.md` when implementation maturity changes.
