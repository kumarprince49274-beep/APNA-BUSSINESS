# Incremental patch after the 39-file baseline

## Files to upload / replace
- `public/app.js` — updated to render Draft Approvals and call existing draft endpoints.
- `public/index.html` — adds navigation item.
- `README.md` — documents extension.

## Dependencies
REQUIRES previous patch already applied: `src/drafts.js`, updated `src/server.js`, updated `src/schema.sql`, and existing `test/drafts.test.js`. The initial 36-file source alone DOES NOT contain these endpoints.

## Corrections to old README
- Version 0.4.0 is a foundation version, not the app's feature-completion percentage.
- Its tree is outdated: it omits banking, reminders, financial-math, drafts and additional tests.
- A passing test suite does not verify GST legal correctness, subscription revenue, OCR, live AI, public deployment or APK/EXE.
- Draft approvals are manual; no AI model is connected.
- Accounting system remains local development-only. No real tax filing or real payment services.

## Validation
Run `npm test` and `npm run dev` from root. Log in, create company, accounts, create draft, confirm reports unchanged; approve draft and confirm a posted voucher appears. Test rejection similarly.

## Remaining roadmap
1. PARTIAL returns/refunds and credit settlement, official tax treatment, automatic statement reconciliation, period close, accounting review and tests.
2. Full UI flows and robust permission/error handling.
3. AI/OCR/PDF/Excel/voice services plus opt-in human approval and privacy safeguards.
4. Verified subscription provider sandbox, webhooks, billing lifecycle, tests.
5. Authentication hardening, backup/restore, security testing and compliance.
6. Hosted web release, Android APK and Windows desktop distributions once production-readiness is established.

Never upload `.env`, SQLite database data, access tokens, or secret credentials.

## Current extension — unpaid full-invoice credit/debit notes
`src/returns.js` and the new Credit & Debit Notes screen add whole-invoice unpaid return workflows, without modifying posted invoice history. The new `test/returns.test.js` checks balanced ledger reversals, FIFO, date-specific GST draft adjustment, company permissions, duplicate requests and explicit limits. See `docs/FULL-INVOICE-RETURNS-UPDATE.md`.
