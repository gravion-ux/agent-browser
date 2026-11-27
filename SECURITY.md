# Security Policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub Security
Advisories for this repository, or by opening a minimal issue that asks for a
private channel without disclosing exploit details.

Do not include credentials, private URLs, or personal data in a report.

## Scope notes

Agent Browser is a bounded research tool for domains the operator is
authorized to access. It blocks private/local network destinations by
default, requires an explicit allow-list, and does not solve CAPTCHAs, evade
bot detection, bypass authentication, or circumvent access rules. See
`docs/SECURITY.md` and `docs/THREAT-MODEL.md` for the full model.

Maintained by Priyanshu Kumar Thakur.
