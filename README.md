# CURRENT PATCH NOTE — 2026-10-15

This repository now supports a **demo extension with read-only TEXT AI**, profile/privacy settings, 3-company seeded testing, employee task/work tracking, basic payroll draft approval, GST review-only reports, and an OPTIONAL Razorpay payment-link integration. All are **development/demo features, not full production legal or finance compliance**. The AI is not a broad generative model unless an external `OPENAI_API_KEY` is set and the user has opted in. Photo/PDF/voice AI processing is excluded. Read `UPLOAD-IN-ONE-STEP.md` for safe upload/merge instructions. The descriptions below include historical foundation status and may refer to older test counts or pre-extension capabilities.

---

> **NEW LOCAL DEMO:** To test all three example companies and added secure work modules, start with [DEMO-START-HERE.md](DEMO-START-HERE.md). This version is NOT ready for production deployment or real financial data.

> **NEW LOCAL DEMO:** To test all three example companies and added secure work modules, start with [DEMO-START-HERE.md](DEMO-START-HERE.md). This version is NOT ready for production deployment or real financial data.

> **NEW LOCAL DEMO:** To test all three example companies and added secure work modules, start with [DEMO-START-HERE.md](DEMO-START-HERE.md). This version is NOT ready for production deployment or real financial data.

# Apna Business — My Business AI Accountant (local developer edition)

**Version:** 0.5.0 working source-code foundation based on the attached Apna Business 6.0 specification.

> **Important:** This project is newly written source code. It is **not** a download or reconstruction of private source code from the existing Replit app. It is **not** the fully implemented 45-part production system described in `docs/MASTER_REQUIREMENTS.txt`. Do not use it to file official GST returns, process real subscription payments, or manage high-stakes production business accounts before expert review.

## Requirements

- **Node.js 22.13+**, preferably a current supported Node 22 maintenance release with `node:sqlite` support. This edition uses the **experimental** built-in SQLite module.
- Windows 10/11, Linux, or macOS.
- Free local storage. **No packages, paid hosting, or API key required** for the local features.

## Run on Windows (PowerShell)

1. Extract the entire ZIP to a folder such as `C:\ApnaBusiness`.
2. Open PowerShell in that folder.
3. Check `node -v`; if unavailable, install the current supported Node.js release from https://nodejs.org/.
4. Run:

   ```powershell
   npm install
   npm run dev
   ```

5. Visit **http://127.0.0.1:3000** in your browser.
6. Register with a strong password (at least 12 characters), log in, and create your business (GST state code e.g. `27` for Maharashtra).
7. Add a supplier, customer, and product. Enter a **purchase before a sale** so FIFO inventory exists.
8. Optional: record owner capital through the Dashboard or Vouchers screen.
9. Run tests with `npm test`.

### Run without watch mode

```powershell
npm start
```

`npm install` creates/validates a dependency-free project. There are no runtime NPM dependencies; all backend packages are Node.js built-ins. If PowerShell blocks npm scripts, use `npm.cmd install` / `npm.cmd run dev`.

### Data and backup

Data is saved at `data/apna-business.sqlite` (and SQLite may temporarily create `-wal`/`-shm` sidecar files). To back up the project data safely, **stop the server** and copy the `data/` folder. Never publish the `data/` directory. The original code ZIP does not include business records.

The default `HOST=127.0.0.1` limits connections to your own machine. Do not expose this dev server to the internet or operate as a public SaaS without security, legal, and accounting reviews.

## Code layout (current files)

```text
APNA-BUSINESS/
├── .env.example
├── .gitignore
├── .github/workflows/tests.yml
├── package.json
├── README.md
├── GITHUB_SETUP.md
├── START-HERE-GITHUB.md
├── UPLOAD-ALL-FILES-FIRST.md
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── favicon.svg
├── src/
│   ├── assistant.js
│   ├── auth.js
│   ├── banking.js
│   ├── companies.js
│   ├── db.js
│   ├── drafts.js
│   ├── financial-math.js
│   ├── invoices.js
│   ├── ledger.js
│   ├── reminders.js
│   ├── reports.js
│   ├── returns.js
│   ├── schema.sql
│   ├── server.js
│   ├── spreadsheet.js
│   ├── subscriptions.js
│   └── utils.js
├── test/
│   ├── accounting.test.js
│   ├── api.test.js
│   ├── banking.test.js
│   ├── drafts.test.js
│   ├── financial-math.test.js
│   └── reconciliation.test.js
└── docs/
    ├── BANK-RECONCILIATION-UPDATE.md
    ├── FULL-INVOICE-RETURNS-UPDATE.md
    ├── DELIVERY_MANIFEST.md
    ├── IMPLEMENTATION_STATUS.md
    ├── MASTER_REQUIREMENTS.txt
    ├── NEW_CODE_AND_LIMITATIONS.md
    ├── NEXT-STAGES-ROADMAP.md
    ├── PATCH-STATUS.md
    ├── PROMPT_COMPLIANCE_AUDIT.md
    ├── USER_SUPPLIED_FINAL_MASTER_PROMPT.txt
    ├── FINAL-LOGIN-FILES-NAVIGATION-UPDATE.md
    ├── FINAL-COMPLETE-PACKAGE.md
    ├── UI-REFERENCE-STYLE-UPDATE.md
    └── SOURCE-REVIEW-AND-GITHUB-UPDATE.md
```

## Screenshot-inspired APNA BUSINESS interface (latest local UI patch)

- Brand displayed in CAPITAL LETTERS: **APNA BUSINESS**.
- Default warm cream workspace, deep green left sidebar, soft white cards, gold selected navigation, charcoal text.
- Optional deep charcoal/green dark theme. Theme preference is saved only in browser localStorage (not in the accounting database).
- Screenshot-inspired **Overview**, **Transactions**, **Reports**, **Files** navigation. The original accounting screens remain accessible from **More business tools**.
- Business overview contains real ledger-backed figures: sales, purchases, profit estimate, cash and bank, inventory, payables and GST draft. Metrics are **all-time recorded** values; they are not misleadingly labeled today's or this month's activity.
- **Record transaction** opens a chooser for existing validated accounting workflows (Sales, Purchases, Owner Capital, Journal).
- **Files** supports company-scoped local uploads and downloads of accepted documents and browser voice-note recording in supported browsers. OCR, transcription, cloud storage and malware scanning are **not implemented**.
- The screenshots informed the layout, but precise pixel identity with the original Replit/PWA app is not guaranteed. Its private source was not used or extracted.
- The existing accounting engine is preserved. New login, document, and server-reliability tests extend verification to **27 passing automated tests** in the reviewed package. Test actual browser navigation, light/dark mode, uploads, microphone and forms on your own computer.

If you already have this app installed locally, **stop the server, then back up `data/`**. Apply the full reviewed source archive while preserving `data/` and `.env`, then restart `npm.cmd run dev`. Browser hard-refresh with Ctrl+Shift+R if old CSS is cached.

## Working features

- Register/login with scrypt password hashing, 7-day HttpOnly session cookies and CSRF protection.
- Separate companies, company-level membership checks, staff roles, protected endpoints.
- Create and list customers, suppliers, products, and chart-of-accounts ledgers.
- Owner capital, balanced double-entry journals, audit log, journal reversal.
- Sales/purchase invoices with configurable per-product GST rates, same-state CGST/SGST or interstate IGST.
- Whole-unit product inventory tracking, FIFO layers, low-stock alerts, discount-adjusted purchase cost allocation.
- Cash/bank partial or full invoice payments; receivables/payables and outstanding balances.
- Profit/loss, balance sheet, trial balance, draft GST totals, stock valuation, daybook, ledger reports, CSV invoice exports.
- Dashboard showing **real recorded** balances, never fake sample figures.
- A limited spreadsheet supporting cell references, ranges and simple arithmetic functions, saved per company.
- Local rule-based accounting Q&A (profit, sales, GST, stock, dues, cash, bank).
- Subscription plan catalog and FREE status only. No fake paid activation or verified payments.
- Manual journal draft approval/rejection screen and API; drafts do not post until approved.
- Manual bank statement line entry and matching/unmatching against already-posted journal lines (not an automatic bank feed or CSV importer).
- Full unpaid sales invoice returns (credit notes) and unused-stock purchase returns (debit notes), with ledger/stock reversal and audit history; no refunds or partial returns.
- Automated checks for posting, FIFO, company isolation, tax, idempotency, draft approvals, bank reconciliation, full unpaid invoice returns, spreadsheet formulas, authentication, document API and static assets; **31 tests passed on Node 22.16.0** in the reviewed package.

## Important limitations (not complete)

- This is an **MVP / foundation**, **not** the complete platform from the 45-part master prompt.
- No real AI model, OCR/photo parsing, audio/video understanding, external knowledge RAG, or automatic AI learning.
- No authorized payment provider, subscriptions billing, refunds, coupons, webhooks, platform revenue settlement, real MRR/ARR.
- No PDF invoice generation or real GST return filing. CSV invoices export is included.
- Invoice discounting is supported; GST rules are simplified and must be verified for actual Indian tax cases including exemptions, cess, ITC and rate changes.
- FIFO covers **whole-unit products**, not fractional quantities, manufacturing, batches, serials or multiple warehouses.
- Full unpaid invoice credit/debit notes are supported in this development patch only. Partial returns, refunds, payments already made, credit application to other invoices, legally complete GST/e-invoicing treatment, period closing and accounting periods are NOT implemented.
- Bank reconciliation is manual and basic: no bank feeds, CSV/Excel import, automated matching, bank balance certification or period locks.
- User-defined journal reversals are supported. Full unpaid invoice returns use a dedicated reversing-voucher workflow; do not reverse invoices manually. Original purchased FIFO lots must be completely unused for a full purchase return.
- Optional email password recovery requires a configured sending service; no email verification, Google login or two-factor auth; do not reuse this local auth implementation for public deployment without further safeguards.
- Spreadsheet is a **limited formula engine**; no .xlsx import/export, formatting, advanced Excel formulas, or real-time collaboration.
- No report PDFs and no external cloud backup. Back up SQLite manually while the server is stopped.
- No test-backed claim of production readiness. Financial and security review needed before actual business use.

## Money design

All official accounting amounts use **integer paise** (₹1.00 = 100 paise), not floating point rupees. Taxes are calculated with integer basis points (18% = 1800 bps). Accounting vouchers must be debit/credit balanced, and stock plus ledger updates occur within a database transaction. Never edit finalized journal history directly.

## REST API examples

All company URLs begin `/api/companies/{companyId}` and require authorized membership.

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/change-password`
- `GET /api/companies`, `POST /api/companies`
- `GET|POST /api/companies/{companyId}/contacts`
- `GET|POST /api/companies/{companyId}/products`
- `GET|POST /api/companies/{companyId}/accounts`
- `GET|POST /api/companies/{companyId}/invoices`
- `POST /api/companies/{companyId}/invoices/{invoiceId}/payments`
- `GET|POST /api/companies/{companyId}/vouchers`
- `POST /api/companies/{companyId}/vouchers/{voucherId}/reverse`
- `GET /api/companies/{companyId}/dashboard`
- `GET /api/companies/{companyId}/reports/{report}`
- `GET /api/companies/{companyId}/subscription`
- `GET|POST /api/companies/{companyId}/workbooks`
- `GET|POST /api/companies/{companyId}/documents`, `GET|DELETE /api/companies/{companyId}/documents/{documentId}`
- `POST /api/companies/{companyId}/assistant`

Mutating authenticated requests must include `X-CSRF-Token` from `/api/auth/me` and use the session cookie. The web frontend handles this.

## Security caution

Passwords are salted and hashed, but this local build is not a substitute for a production identity provider, secure TLS termination, rate-limited distributed sessions, tenant security penetration tests, independent backup/restore rehearsal or legal audit. Do not paste API keys into the source code or commit `data/` or `.env` files.

See `docs/IMPLEMENTATION_STATUS.md` for a feature-by-feature status.


## Prompt alignment and delivery truth

Read `docs/PROMPT_COMPLIANCE_AUDIT.md` before treating this source as feature complete. The new `src/financial-math.js` contains integer-safe standalone formula helpers, with tests; it is **not yet wired into all screens or invoice posting services**.


## Extension: manual approval workflow (API only)
`src/drafts.js` adds a company-scoped journal draft review queue. Pending drafts never post ledger entries until an authorized OWNER or ACCOUNTANT approves them through the authenticated API. See `docs/NEXT-STAGES-ROADMAP.md`. This is **not** a real multimodal AI feature or payment gateway.


## Latest incremental update — Draft approval frontend
The **Draft Approvals** navigation screen calls the authenticated draft API. It lists drafts, lets users create balanced two-line drafts, and asks for human confirmation before approval or rejection. Only authorized roles can perform protected actions; server checks remain authoritative.
This is **not** an OCR, generative AI, multi-currency, GST filing, payment provider or public-launch feature.

## Latest incremental update — Basic bank reconciliation
The **Bank Reconciliation** screen supports manual statement line entry, selecting matching previously posted bank journal lines, and unmatching with an audit event. Reconciliation does not create a voucher, move money or connect to a bank. For details and limits see `docs/BANK-RECONCILIATION-UPDATE.md`.


## Latest incremental update — Full unpaid invoice returns (credit/debit notes)
A new **Credit & Debit Notes** screen and the authenticated `POST /api/companies/:companyId/invoices/:invoiceId/full-return` route can reverse a **whole, unpaid** sales or purchase invoice. It creates a **new** balancing voucher and audit event without deleting original records. GST draft calculations subtract original tax components on the *return date*; accountant review is still required.

Limits: NO partial returns, NO invoice with any posted payments, NO money refunds, NO exchanges, NO automatic bank payouts, NO official GST filings. Full purchase returns are blocked once any original purchase FIFO lot has been used. Test changes with `npm test` and inspect `docs/FULL-INVOICE-RETURNS-UPDATE.md`.


## Latest: account login, logo, sidebar and private company file library

User-chosen email/password registration remains supported; registration now includes confirmation and show/hide password. Logged-in users can change password in Settings. Company-wise local document storage (up to 5 MB per file; max 50 MB / 100 files per company) supports uploads/downloads and voice-note recording in supported browsers. This is **not** OCR, voice transcription, cloud storage, security-certified production document handling, or email-password reset. See `docs/FINAL-LOGIN-FILES-NAVIGATION-UPDATE.md`. Data stays in the local SQLite database and is never included in the downloadable source ZIP. All accounting features and no-production-use warnings continue to apply.

## Reviewed source patch — login and server stability

The server now counts **failed login attempts only** for the rate limit, clearing the count after a successful login. Previously, successful logins incorrectly accumulated toward the limit. Static asset file-serving errors are handled safely. The new `test/server-reliability.test.js` verifies both behaviors. See `docs/SOURCE-REVIEW-AND-GITHUB-UPDATE.md`.


## New Stage 3 hardening — local backup and optional email reset

- New password reset flow: Forgot Password button, password reset link with a one-time, SHA-256-hashed token (valid 20 minutes), and automatic logout of previous sessions after password reset. **Real delivery needs a provider account and verified sending domain**, e.g. Resend. Without configuration the app explicitly reports that recovery email is unavailable. Never paste API keys into GitHub. See `docs/STAGES-3-9-CURRENT-STATUS.md`.
- SQLite consistent backups: with Node.js installed, use `npm.cmd run backup`. The file is created in the ignored `backups/` folder, and SQLite integrity checking runs before it is accepted. Treat the backup as sensitive.
- Restore **only when the server is stopped**, after keeping your own extra copy: `npm.cmd run restore -- backups/<backup-file.sqlite> --confirm-server-stopped`. The restore script creates an additional safety copy of the old database and refuses to overwrite when WAL sidecars are present.
- Optional web-app manifest uses APNA BUSINESS branding. It is not an Android APK or Windows EXE.
- Latest test count on Node v22.16.0: **31/31** (login and password reset, document security, accounting and backups). Test results do not establish production readiness.

## Production deployment not yet supported

There is **no** deployed full SaaS, verified payment gateway, generative AI/OCR integration, complete Indian GST certification, Android APK, or Windows EXE in this source. Public release requires external service credentials, security hardening, legal and accounting validation, production infrastructure and end-to-end QA.
