# APNA BUSINESS — verified implementation status and next work

**Local version 0.5.0.** Source code is newly written; it is not a copy of private Replit source. The 45-part master requirements document is a specification, not a claim of implementation.

| Stage | Current verified implementation | Major missing items |
|---|---|---|
| 3 Backend | SQLite database, login with hashed user-defined passwords, change password, optional email reset flow, multiple companies, role-based API authorization, private company document library, HTTP APIs, tested backup script | Provider setup/verification for actual reset emails; verified email accounts, 2FA, distributed session storage, production backup/restore automation, tenancy security review, and PostgreSQL for SaaS |
| 4 Accounting | Central double entry, posted vouchers, sales/purchases, basic CGST/SGST/IGST, FIFO whole-unit lots, trial balance/P&L/balance sheet, full unpaid invoice returns, manual reconciliation | GST legal verification and updates, partial returns/refunds, advanced stock, accounting locks, complex tax situations, PDF invoices, bank feed integrations |
| 5 Frontend | Screenshot-inspired cream/green/gold UI, logo, responsive screens and navigation, light/dark mode, browser-based file upload and audio capture when supported | Full accessibility, extensive mobile testing, all advanced screens/functions, final visual QA |
| 6 AI Accountant | Local deterministic, read-only accounting questions | Real model/API integration, explicit consent for sending private data to external services, OCR, PDF/Excel understanding, Hindi/Hinglish transcription, safe document RAG, approval-based AI proposed postings |
| 7 SaaS & Revenue | Plan catalog (display only) | Gateway onboarding, verified webhooks, secure subscriptions, real receipts/refunds, quotas, platform ledger, verified MRR/ARR |
| 8 Tests & Security | 31 passing local automated tests on Node v22.16.0, CSRF, hashed passwords, role checks, basic rate limiting, SQLite backup integrity tests | Comprehensive adversarial pentest, professional accounting/GST audit, external gateway webhook validation and reliability, full browser+mobile end-to-end tests, hosted backup/disaster recovery drills |
| 9 Launch | Local web server, initial app manifest, source ZIP with Windows setup commands | Cloud hosting/production database, TLS and domain setup, signed Android APK, Windows EXE, update system, multi-device sync |

## Password reset configuration (optional)

The app does not send email without a configured external provider. **Do not include keys in source or GitHub.** With a verified sending domain in a provider like Resend, set environment variables in your local terminal or server's secret manager:

- `RESEND_API_KEY` — server-side email service API key.
- `RESET_EMAIL_FROM` — verified sender, e.g. `APNA BUSINESS <no-reply@your-domain.example>`.
- `APP_BASE_URL` — exact HTTPS URL of the deployed app; localhost works only when you open email links on the same device and use its correct local host/port.

Passwords and reset tokens are never sent as passwords by email. A temporary URL fragment holds the one-time reset token; only its SHA-256 hash is in the database. Tokens expire in 20 minutes, are single-use, and invalidate old login sessions on successful reset. Provider verification, delivered-email behavior, spam filtering and domain DNS **have not been tested**.

## Data backup and restore (safe local workflow)

1. Never delete `data/` or overwrite its `apna-business.sqlite` without a verified backup. It includes business records AND company documents. Never upload `data/`, `.env`, `backups/`, API keys, or real company records to GitHub.
2. From the project root, run `npm.cmd run backup`. The script creates a new unique `backups/apna-business-<timestamp>.sqlite`, and checks `PRAGMA integrity_check`.
3. Keep a separate offline encrypted copy of your backup. Do not assume one copy is a disaster recovery plan.
4. Restore with the app completely **stopped** using `npm.cmd run restore -- backups/<filename>.sqlite --confirm-server-stopped`. The script makes a secondary safety copy before replacement and rejects existing WAL sidecar files. If WAL files remain, contact a developer before restoring; do not delete them manually.

## GitHub upload and deployment

Upload the unzipped `src/`, `public/`, `test/`, `docs/`, `scripts/`, `.github/`, and root configuration files. The GitHub repository was previously missing most source directories. Do not upload only `README.md` and `package.json` and do not upload the ZIP as a single blob expecting GitHub to extract it. Run GitHub Actions and confirm tests before deploying. Connecting GitHub with read-only access does not let the assistant push code.

Do **not** put this development application on a public internet host with real customer financial data yet. A proper production migration and security review is required. Stage 6-9 work needs vendor accounts, approved access, domain and hosting choices, full QA and in some cases paid infrastructure.
