# Secret Audit — motionmavericks/code — 20250921

- generated: 2025-09-21T16:00:58+10:00
- gitleaks: 8.18.4
- trufflehog: not_run
- deep_scan: true

## Findings (redacted)

- Detector: generic-api-key
  - Location: codex-rs/cli/src/login.rs:161
  - Commit: 
  - Excerpt: key = "REDACTED"
- Detector: generic-api-key
  - Location: codex-rs/cli/src/login.rs:167
  - Commit: 
  - Excerpt: key = "REDACTED"

- Detector: generic-api-key
  - Location: codex-rs/cli/src/login.rs:161
  - Commit: 7ad557b85aa7f253ecaba3f41f7eb28c6292eedc
  - Excerpt: key = "REDACTED"
- Detector: generic-api-key
  - Location: codex-rs/cli/src/login.rs:167
  - Commit: 7ad557b85aa7f253ecaba3f41f7eb28c6292eedc
  - Excerpt: key = "REDACTED"
- Detector: generic-api-key
  - Location: codex-rs/cli/src/login.rs:161
  - Commit: 4041693f32142df0769537464cda89afe5ff9c8a
  - Excerpt: key = "REDACTED"
- Detector: generic-api-key
  - Location: codex-rs/cli/src/login.rs:167
  - Commit: 4041693f32142df0769537464cda89afe5ff9c8a
  - Excerpt: key = "REDACTED"

## Remediation plan
- Replace hard-coded secrets with env vars or secret manager references.
- Add .gitignore for .env*, credentials, and build artifacts.
- Add pre-commit hook to run `gitleaks protect`.
- Rotate any exposed keys at the provider.

## History rewrite (optional)
- Only performed if CONFIRM_HISTORY_REWRITE=true.
- Force-push required. May break forks and SHAs.
