# APNA BUSINESS — 3-Company Interactive Demo (October 2026)

This project is a demo extension of the user's **existing accounting project**, not a finished Odoo competitor or production-ready SaaS. It adds functioning multi-company demo data, safer 8+ password policy, optional GST type, company settings, task assignment/status and audit views, scoped department WORKFLOW records, user profile/privacy request, employee work summaries, and read-only business Q&A. Existing invoice, FIFO, ledger and reporting functionality is preserved.

## ⚡ Quick start — Windows terminal in extracted ZIP folder

**Easy Windows start:** Extract everything, then double-click `START-APNA-DEMO-WINDOWS.bat`; with Node.js 22 installed, it creates the sample database (if absent) and starts the local website. Open `http://127.0.0.1:3001`.

1. Install Node.js 22.16.0 (or compatible Node 22).
2. Run `npm.cmd install`
3. Run `npm.cmd test`
4. Run `npm.cmd run demo` — creates a NEW file `data/apna-demo.sqlite`; refuses to overwrite if it already exists.
5. Run `npm.cmd run demo:start`
6. Open **http://127.0.0.1:3001** (LOCAL COMPUTER ONLY; not a public URL).

Test logins, all sharing the locally-known password `Demo@2026Safe!`:

| Email | Test role |
|---|---|
| `owner@demo.apna.test` | Owner of all 3 companies |
| `sales@demo.apna.test` | Sales on Kirana/Electronics |
| `accounts@demo.apna.test` | Accounting on Electronics/Factory |
| `hr@demo.apna.test` | HR department grant on Factory |
| `purchase@demo.apna.test` | Purchase grant |
| `factory@demo.apna.test` | Manager on Manufacturing |
| `outside@demo.apna.test` | No company memberships — try forbidden access |

**Never use demo identities/passwords or this seeded database in Render/live deployment.** Even if you only share this ZIP, it contains well-known passwords specifically for a LOCAL test.

## Example 3 companies

- **SHARMA KIRANA STORE** — business state 09 UP; explicitly UNREGISTERED GST; capital ₹50,000; purchase ₹12,000; sale ₹8,000; cash received ₹5,000; customer owes ₹3,000. Product configured 18% but this company has no GST charged (special demo treatment; do not use for legal invoices).
- **SMART ELECTRONICS PVT LTD** — state 09, demo GSTIN `09ABCDE1234F1Z5` (fictional); a ₹10,000 taxable laptop sale + 18% illustrative tax = ₹11,800, collected ₹5,000, outstanding ₹6,800. Sales/Accountant/Purchase employees with tasks.
- **APEX MANUFACTURING LTD** — state 27, fictional GSTIN `27ABCDE1234F1Z5`, production tracking demo record says 420 units of 500 (not actually posted as production inventory). HR, Finance, Purchase, Factory manager work.

## Try these questions in AI Chat

- `How much profit?`
- `What is my cash balance?`
- `Which products are low stock?`
- `Who completed employee tasks?`
- `How much customer payment is due?`
- `आज मेरे कर्मचारियों ने कितना काम किया?`

Without an external API key, the assistant is **LOCAL RULES + READ-ONLY WORK SUMMARY**, not a generative AI model. It never automatically posts accounting transactions. Optional generative responses use `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4.1-mini`, and **personal opt-in via My Privacy**. It sends a LIMITED verified company context to the provider, not raw uploaded PDFs, photos, personal payroll, or other company data. Using an API provider may require payment; verify its privacy terms before consenting.

## Important system limits

- Odoo-style departments here are **draft workflow trackers**, not full operational ERP apps. CRM/HR/Manufacturing/Projects do not calculate payroll, manufacturing costing, official tax returns, enterprise inventory or legal filings.
- Existing document/voice upload saves files. **No OCR, PDF understanding, voice transcription, AI file analysis.**
- Company GST registration type changes invoice tax behavior for explicit UNREGISTERED mode; COMPOSITION/OTHER invoices are intentionally blocked until validated separately. Existing legacy company tax handling is preserved for backward compatibility. GSTIN check is format/state check only; not official verification.
- Role grants protect the newly built departments, tasks and management analytics; the ORIGINAL legacy read endpoints still have broad existing role access. **This is not production-grade, least-privilege ERP.** Audit those before real client onboarding.
- Mobile profile number is not OTP-verified. Privacy deletion requests go to a local review queue; no irreversible automatic removal of tax/legal records.
- Company 'second password' is intentionally not implemented; use personal accounts and eventual MFA/step-up authentication, not shared company secrets.
- No real subscription payments/webhooks or persistent managed database. The existing Render free-instance SQLite data can disappear after redeployment/restart. For real businesses migrate to durable managed database and perform security/compliance review.
- `data/`, `.env`, and API secrets must NEVER be committed to GitHub.

## Changed/new file manifest

Read `CHANGED-FILES.txt` and `CHANGED-SOURCE-CODE.txt` in this ZIP. Full original project files are included so there is no copy-paste path guesswork. `npm test` includes new permission/isolation/demo tests.
