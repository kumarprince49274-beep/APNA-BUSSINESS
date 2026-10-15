# APNA BUSINESS — Bank Reconciliation UI update

This describes the bank reconciliation extension now included in the complete APNA BUSINESS local developer snapshot. It is not the full accounting, AI or SaaS product.

## What is actually implemented

- **Bank Reconciliation** item in the sidebar for supported bank asset ledgers (`1010` or an asset ledger with “bank” in its name).
- Enter **one bank statement line** at a time with date, reference, signed amount in rupees and description. A positive amount represents a bank inflow, a negative amount an outflow.
- Existing statement entries are deduplicated by `external_id` or a deterministic date/reference/amount key.
- See imported bank statement lines for the selected company and bank ledger.
- Fetch up to **500 unmatched, already-posted bank journal lines** from the same company and account, sorted by date descending.
- Choose an eligible line with exactly the same signed amount and **confirm** the match; an account entry cannot be matched twice.
- Authorized OWNER/ACCOUNTANT may **unmatch**, which records a separate audit event; no previously posted accounting entry is deleted.
- Tests for matching, unmatching, company isolation, amount checking, CSRF, API authorization, and duplication.

## New API endpoints

All requests require an authenticated session, company membership and proper role. POST requests require `X-CSRF-Token`.

- `GET /api/companies/:companyId/banking/:accountId/candidates`
- `POST /api/companies/:companyId/banking/:accountId/unmatch` with JSON `{ "statement_id": "..." }`

Existing endpoints reused:

- `GET /api/companies/:companyId/banking/:accountId/statement`
- `POST /api/companies/:companyId/banking/:accountId/statement` with `{ "lines": [{ "date": "2026-10-14", "reference": "TX1", "amount_paise": 25000 }] }`
- `POST /api/companies/:companyId/banking/:accountId/match` with `{ "statement_id": "...", "journal_line_id": "..." }`

## Important safety/functional limits

- **No new money is moved or posted by reconciliation.** Matching associates evidence with already-posted accounting movements.
- The UI does **not** import bank CSV/Excel files automatically; it supports manual entry per statement line. Backend accepts bounded JSON batches up to 500 lines.
- Matching uses **exact amount and account**, not automatic name matching, transaction-date tolerance, bank balance verification or real bank APIs.
- The candidate API is limited to the 500 newest unmatched movements; paginate before relying on this for large books.
- Entries cannot be edited in place and reconciled period locking has not been implemented.
- Financial statements, inventory returns, GST revisions, real AI, real payments, account recovery, automated backups, public hosting, APK and EXE remain out of scope.
- The user interface is still a developer prototype. Automated module and API tests passed; this is not a production security or financial audit.

## Test locally

```powershell
npm install
npm test
npm run dev
```

Open `http://127.0.0.1:3000` and navigate to **Bank Reconciliation** after logging in and creating a company. First create a legitimate bank-related posted voucher (for example owner capital paid into Bank). Then import a matching positive statement amount and link it to the posted journal bank line. Check the match and unmatch results. Try an incorrect amount to verify that no match can be posted.

## Installation

For a fresh repository, upload the entire latest complete-source ZIP, not an earlier patch. See `UPLOAD-ALL-FILES-FIRST.md`. Do not commit `.env`, database files or private data.
