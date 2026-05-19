# Security Policy

## Reporting

Email security reports to **security@gearuptofit.com**. Please do not open public issues for security-sensitive findings.

We aim to acknowledge reports within 72 hours.

## Scope

- The Supplement Match app (this repo) — deployed at https://nutri-match-wiz.lovable.app and embedded on gearuptofit.com.
- The app is **stateless** — no user accounts, no server-side answer storage. Quiz answers are encoded into the result URL (`?d=…`). There is no PII database to compromise.

## Out of scope

- Editorial content / health claims (those go through clinical review separately, not security).
- Affiliate link tracking parameters.

## Hardening notes

- All outbound product links use `rel="nofollow sponsored noopener"`.
- No third-party tracking scripts ship by default.
- The recommendation engine is deterministic and runs client-side — no remote-config attack surface.
