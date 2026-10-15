# APNA BUSINESS — implementation update

This ZIP keeps every original source file from the revised source archive. New working modules include `src/banking.js` (statement-line import, idempotent deduplication, explicit journal matching with amount checks and audit logging) and `src/reminders.js` (low-stock and unpaid-invoice queries). They have HTTP API routes protected by the project's existing role and CSRF middleware.

**Not implemented:** complete AI document OCR, speech and video, full formula-compatible spreadsheet engine, verified Indian GST filing, payment gateway, robust production SaaS subscriptions, production hardened migrations, Android APK, Windows EXE, and the dozens of other requirements from the supplied master prompt. Existing prototype auth and finance modules are not independently audited for use with real customer data. Bank matching is *not* bank payment initiation or automatic reconciliation.

## Endpoints
- GET `/api/companies/:companyId/reminders`
- GET `/api/companies/:companyId/banking/:accountId/statement`
- POST `/api/companies/:companyId/banking/:accountId/statement` body `{"lines":[{"date":"2026-10-14","external_id":"txn-123","reference":"txn-123","description":"Bank credit","amount_paise":2500}]}`
- POST `/api/companies/:companyId/banking/:accountId/match` body `{"statement_id":"...","journal_line_id":"..."}`

POST endpoints require login, role OWNER or ACCOUNTANT, and a valid CSRF header. Statement lines have signed amounts: deposits positive and withdrawals negative. No ledger entry is created by importing statements.
