# APNA BUSINESS — Full unpaid invoice credit/debit notes (local MVP)

## Implemented, narrowly
- **Sales credit note**: Entire original unpaid sales invoice only. Post balanced voucher that reverses original revenue, original GST, A/R and COGS, and restock returned units using saved original COGS total. Original invoice history stays intact.
- **Purchase debit note**: Entire original unpaid purchase invoice only. Reverses inventory, input GST and A/P, removes remaining stock quantities from the original purchase voucher. Refuses returns if **any** original FIFO lot has been consumed.
- One note per original invoice; repeated requests return the existing note instead of posting another voucher.
- Returned invoices are no longer counted in outstanding invoices, reminders or allowed to accept a payment. The dashboard's purchases figure and draft GST summary deduct full notes; notes are booked against the note date.
- Dedicated UI (Invoices → Full Return and Credit & Debit Notes), REST API, audit log and tests. Only OWNER/ACCOUNTANT can create notes.

## API (requires session cookie, CSRF token and company membership)
`GET /api/companies/:companyId/returns`
`GET /api/companies/:companyId/returns/:returnId`
`POST /api/companies/:companyId/invoices/:invoiceId/full-return`
Body: `{"date":"2026-10-14"}`. The date cannot be earlier than the invoice date. No amount or qty inputs are accepted.

## Strong limitations — IMPORTANT
1. **Only FULL, UNPAID invoices.** No partial returns, refunds, already-settled invoices, customer-wallet credits, exchange orders, or payment-processor refunds.
2. Full purchase returns require ALL original purchase FIFO layers untouched, even if equivalent stock was later bought or returned. This is intentionally conservative.
3. Restored sales inventory retains the original invoice's total COGS, but does not reconstruct exact original FIFO-batch provenance.
4. This is only a *draft local accounting treatment*, **not verified GST compliance**: debit/credit note references, timing of GST adjustments, e-invoicing/GSTR rules and ITC require an accountant's review.
5. No browser E2E testing or production legal/security audit. Do not run with live business money or use for official tax filings.

## Verification
`npm test` (22/22 locally on Node 22.16.0); `npm run dev` and manually test: unpaid Purchase → unpaid Sale → Full Sales Return → note, stock and P&L; unpaid unused Purchase → Full Purchase Return; paid purchase and used-stock purchase both blocked.

## Upgrade
Back up your existing repository, and back up the SQLite database with the server stopped. `src/schema.sql` adds the new `invoice_returns` table using `CREATE TABLE IF NOT EXISTS`; startup creates it without deleting existing tables. Review all diffs before replacing updated source files.
