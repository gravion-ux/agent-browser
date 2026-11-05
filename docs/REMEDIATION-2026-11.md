# Agent Browser remediation — 2026-11-05

This file records a defect audit and the fixes applied on top of the published
v0.4.3 tree. The original `README.md`, `CHANGELOG.md`, `docs/AUDIT-REPORT.md`,
`docs/TEST-RESULTS.md` and `docs/SECURITY.md` are left unchanged so the earlier
audit record stays intact; this file is the new evidence.

Audit method: `src/policy.js`, `src/challenge.js` and `src/network.js` were read
in full, then each suspected weakness was probed with concrete inputs. The
allow-list matching, the private-network blocking and the redirect behaviour
were checked for bypasses and none was found; the defects below are the real
ones. Every fix is covered by a regression test that fails on the pre-fix code.

## Fixes

### 1. A single-label allow-list entry widened the boundary (medium)

* Where: `src/policy.js`, `canonicalDomain`.
* Cause: the allow-list accepted any syntactically valid hostname, including a
  single label. `--allow-domain com` was accepted, and because the target check
  matches a host that equals the entry or ends with a dot and the entry, every
  host under that public suffix became reachable. The same held for `test` and
  for any other single label. The README describes an "explicit hostname
  allow-list", so this silently contradicted the documented boundary.
* Fix: an allow-list entry must now have at least two labels and every label
  must match a DNS label shape. IP literals are rejected as well, because the
  allow-list is defined in terms of hostnames. Multi-label entries and their
  subdomains are unaffected.
* Test: `test/policy.test.js` — `rejects single-label allow-list entries`,
  `rejects IP-literal allow-list entries`,
  `still accepts a multi-label allow-list entry and its subdomains`.

### 2. Challenge detection missed common challenge pages (medium)

* Where: `src/challenge.js`, `CHALLENGE_PATTERNS`.
* Cause: the pattern list covered a narrow set of phrasings. Pages that said
  "Verify you are a human", "Sign-in required", "Login required", "Your session
  expired", "You don't have permission to access", "Please enable JavaScript and
  cookies to continue" or "Please enable JS and disable any ad blocker" were not
  detected, so the agent continued against a challenge page instead of pausing
  for the operator. A missed challenge is the unsafe direction: the run
  continues against a page that is gating access.
* Fix: the patterns now cover the missing human-verification, sign-in,
  session-expired, permission-denial, blocked-request, JavaScript and cookie
  interstitial, and ad-blocker phrasings. Existing categories are reused, so the
  reported challenge names are unchanged.
* Test: `test/challenge.test.js` — five new cases covering the phrasings above.

## Test status after the fixes

| Suite | Before | After |
|---|---|---|
| `test/*.test.js` | 19 | 27 |

Full local gate on 2026-11-05 (Windows 11, Node v24.14.0): 27/27 tests passed,
`scripts/syntax-checks.py` 8/8 checks passed, `scripts/scan-secrets.py` clean.
The Playwright runtime smoke is maintained separately and was not executed
locally in this pass.

## Known limitations that were deliberately not changed

* Challenge detection still produces false positives on documentation prose that
  mentions challenges — for example a page explaining that an endpoint returns a
  CAPTCHA when it is rate limited. A false positive only pauses the run, while a
  false negative lets the run continue, so the pattern list was widened only in
  the direction that pauses. `README.md` already documents that detection is
  heuristic and may false-positive on page text.
* `src/network.js` resolves DNS once per request and does not eliminate
  DNS rebinding or time-of-check-to-time-of-use races. This remains the
  residual risk recorded in `docs/AUDIT-REPORT.md`.
* Any name ending in `.localhost` or `.local` is treated as local and blocked
  unless the operator opts in with `--allow-private-network`.
