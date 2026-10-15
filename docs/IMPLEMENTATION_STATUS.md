# Implementation status — Apna Business 6.0 source foundation

Source: `MASTER_REQUIREMENTS.txt` (45 sections; requirements, not original private Replit code).

| Module | Status | Notes |
|---|---|---|
| Desktop/mobile-responsive dashboard | IMPLEMENTED (basic) | Saved-ledger figures; no charts/widgets customization |
| Email registration/login | IMPLEMENTED (local) | scrypt + sessions; no verification/reset/Google OAuth/2FA |
| Multi-company roles | IMPLEMENTED (basic) | Route-enforced company membership and staff roles |
| Ledgers / groups / masters | PARTIAL | Five account types, preset system ledgers and custom accounts |
| General journal | IMPLEMENTED (basic) | Double-entry, atomic SQL, audit, journal reversals |
| Other voucher types | PARTIAL | Sale/Purchase/Receipt/Payment plus full unpaid invoice credit/debit notes; no partial notes, contra or refunds |
| Sales billing | IMPLEMENTED (basic) | Taxable amounts, customer outstanding, GST, payments, CSV export |
| Purchase management | IMPLEMENTED (basic) | Supplier credit/cash invoices, FIFO stock receipt |
| GST engine | PARTIAL | Product rate, intra/interstate, draft summary, date-based full note adjustment; no filing/e-invoice/cess/ITC evaluation |
| Inventory | IMPLEMENTED (basic) | Whole-unit FIFO and safe full-invoice returns; fractional stock, partial returns and warehouses missing |
| Financial reports | PARTIAL | P&L, BS, TB, stock, outstanding, GST, daybook, account-ledger |
| Bank transactions | PARTIAL | Cash/bank accounts + payments; manual statement entry and matching; no automated feeds/import |
| Spreadsheet | PARTIAL | Limited arithmetic / formulas; no XLSX support |
| AI Accountant | PARTIAL | Deterministic on-device answers, not generative AI |
| OCR/photo/voice/video | NOT STARTED | No upload processing |
| Private RAG knowledge | NOT STARTED | No embeddings/vector DB |
| Learning from corrections | NOT STARTED | No approved rule system |
| Subscriptions | PARTIAL | FREE plan and catalog only |
| Provider payment checkout / webhook | NOT STARTED | No simulated paid activations |
| SaaS owner real revenue dashboard | NOT STARTED | No verified transaction data |
| Automated tests | TESTED (core) | 22 tests passed locally for this patch; coverage and compliance review are not exhaustive |
| Deployment security/hardening | NOT STARTED | Local development edition only |

**Meaning:** The ZIP contains genuine source for the working modules plus the full original 6.0 requirements text. It does **not** falsely represent all 45 sections as production-complete.
