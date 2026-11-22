# Contributing to Agent Browser

Thanks for helping! Agent Browser is a visible Playwright browser
starter for bounded research on domains the user is authorised to
access. It enforces an explicit hostname allow-list and detects
common CAPTCHA, anti-bot, login/MFA, rate-limit, consent and
access-denial indicators.

The most valuable contributions are new block/allow-list hardening,
new page-state detectors, and tests.

## Ground rules

- **Authorised domains only — hard rule.** The browser may only
  visit the exact host (or subdomains) passed via `--allow-domain`.
  Contributions must not loosen this: no wildcard browsing, no
  silent allow-list expansion, no bypass of the private/local
  network block (`--allow-private-network` stays an explicit,
  visible opt-in).
- **Visible, not stealth.** The browser is deliberately visible and
  honest about being automated. Do not add fingerprint-masking or
  anti-detection evasion features.
- **Stop at the wall.** When a page shows a CAPTCHA, login/MFA,
  rate-limit or access-denial indicator, the tool detects and
  reports it — it does not try to defeat it.

## Development setup

Requires Node.js 20 or newer and Playwright Chromium:

```bash
git clone https://github.com/gravion-ux/agent-browser.git
cd agent-browser
npm ci
npx playwright install --with-deps chromium
```

## Running the tests

```bash
npm test                    # node --test ./test/*.test.js
npm run smoke:runtime       # runtime smoke tests
npm start -- --help         # CLI smoke check
```

CI additionally runs a secret scan
(`python scripts/scan-secrets.py .`) and static syntax/manifest
checks (`python scripts/syntax-checks.py .`) — run both before
opening a PR if you touched scripts or the manifest. CI tests on
Node 20 and 22.

## Code style

- Plain Node.js ES modules; no build step.
- Tests use the built-in `node --test` runner and live in `test/`.
- Comments explain *why* a host, range or indicator is blocked —
  the block lists are the security model, not boilerplate.

## Pull request workflow

1. Fork and branch from `main`: `feat/<short-name>`,
   `fix/<short-name>`, `docs/<short-name>`.
2. Run the full test suite and the runtime smoke test locally.
3. Open the PR against `main` with: what changed, why, how you
   tested it. For allow/block-list changes, state the threat the
   change addresses.
4. CI must be green — secret scan, syntax checks and Node tests.
5. One logical change per PR.
