# Agent Browser v0.4.3

A visible Playwright browser starter for bounded research on domains the user is authorized to access. It enforces an explicit hostname allow-list and detects common CAPTCHA, anti-bot, login/MFA, rate-limit, consent and access-denial indicators.

## Requirements

- Node.js 20+
- Playwright Chromium

## Install and run

```bash
npm install
npx playwright install chromium
npm test
npm start -- --url https://example.com --allow-domain example.com
```

The browser is visible (not headless) and only the exact host or its subdomains matching `--allow-domain` are allowed. Private/local network destinations are blocked by default; `--allow-private-network` is an explicit opt-in for local systems you own or are authorized to test. Redirects and subresource requests outside the allow-list are blocked. DNS results resolving to loopback, private, link-local, documentation or otherwise non-public ranges are also blocked by default.

Options that take a value accept both spellings: `--url https://example.com` and `--url=https://example.com` are equivalent. A value that starts with `--` is still refused, so a value can never be mistaken for another option.

## Human handoff

When a known challenge pattern is detected, the browser pauses in an interactive terminal and asks the user to complete the step manually in the visible browser. It re-checks the page after the user presses Enter. In a non-interactive environment it reports `HUMAN_HANDOFF_REQUIRED` and stops. Detection is heuristic: sites may use custom challenge pages or false-positive page text. The project does not solve CAPTCHAs, forge browser fingerprints, evade bot detection, bypass authentication or circumvent access rules.

## Current limits

This is not yet a general autonomous AI agent: there is no planner, external search connector, multi-step task queue or persistent profile manager. The CLI performs one bounded navigation and extracts a limited text snapshot. Page content is untrusted and must not be treated as instructions.

---

## Part of the Gravion Toolkit

This repository holds one project from the four-project Gravion Toolkit. The projects are independent and can be used separately.

| Project | Purpose | Repository |
|---|---|---|
| localshare | Share a local development server through Cloudflare Quick or Named Tunnels | https://github.com/gravion-ux/localshare/tree/main |
| privacyflow | Validate authorized VPN profiles and plan safe rotation workflows | https://github.com/gravion-ux/privacyflow/tree/main |
| **This repository** | Run permission-aware browser tasks on allow-listed domains | https://github.com/gravion-ux/agent-browser/tree/main |
| gravion-trainner | Evaluate AI models against a JSONL dataset and report quality | https://github.com/gravion-ux/gravion-trainner/tree/main |

The four projects are **development foundations and MVP scaffolds**, not production services. They do not provide anonymity guarantees, CAPTCHA or anti-bot bypass, universal model retraining, or a managed multi-tenant sharing relay. See [the shared security notes](docs/SECURITY.md), [the threat model](docs/THREAT-MODEL.md) and [the roadmap](docs/ROADMAP.md) for the boundaries and the planned work.
