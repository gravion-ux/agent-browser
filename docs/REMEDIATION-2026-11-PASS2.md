# Remediation notes — 2026-11, second pass

This file records the second audit pass over the Agent Browser repository in
November 2026. It is additive: the earlier `docs/REMEDIATION-2026-11.md` keeps the
record of the first pass and is not modified by this one.

## Method

Every source file, test file and document was read again. Each suspected defect was
confirmed with a regression test before the fix was applied.

## Defects fixed

| Severity | Defect | Fix |
| --- | --- | --- |
| Medium | The command-line parser was not exported and no test covered it, so the whole argument surface — URL, allow-list, timeout, character limit and the private-network switch — was untested | The parser is exported and a new `test/cli.test.js` suite covers every option, every rejection and the target validation |
| Low | The common `--flag=value` spelling was rejected with `Unknown or incomplete option: --url=https://example.com`, a message that implies the option does not exist | The parser expands the inline form to the spaced form, so both spellings reach the same validation; an inline value on an option that takes none is reported as such |
| Low | `docs/TEST-RESULTS.md` claimed 82/82 tests from the 2026-11-04 run while the suites had grown since | The document now records the verified counts of the current run: 153 tests, 152 passed, 1 skipped, and it marks the old figure as superseded |

## Fixes re-verified, no change needed

The first pass already fixed the following, and this pass confirmed the fixes are
present in the published code: the domain allow-list rejects IP literals and
single-label entries, the request interception re-checks every request against the
allow-list and the private-network rules, and the error path prints one line
instead of a stack trace.

## Documentation and spelling corrections

- `LICENSE` shipped a truncated MIT text without the warranty and liability
  clauses. The complete canonical MIT text is now in place.
- Spelling was inconsistent (`authorised` against `authorization` and `normalized`).
  The prose now uses one convention: American English.

## Verification

| Check | Before | After |
| --- | --- | --- |
| Agent Browser tests | 27 passed | 43 passed |
| Documented test total | 82/82 (stale) | 153 tests, 152 passed, 1 skipped |

## Residual limitations

- The browser runtime smoke test needs Playwright and a Chromium build. It is
  maintained separately as `npm run smoke:runtime` and is not part of the unit
  suite.
- The private-network check resolves the target host once, before the request is
  made. A host that changes its DNS answer between the check and the request is
  not covered by a test here.
- Agent Browser never solves or bypasses a challenge. It stops and asks for a
  human.
