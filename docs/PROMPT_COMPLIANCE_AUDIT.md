# APNA BUSINESS — Master Prompt Compliance Audit

Reference: user-supplied 2026-10-14 full development prompt. **The code is a local foundation, not the fully realized SaaS described in the prompt.** Every old source file has been preserved. Do not use real customer financial data or process real payments in this prototype.

| Prompt requirement | Current assessment | Next work |
|---|---|---|
| Brand APNA BUSINESS + cream/green/gold | Basic UI; verify on screens | Full responsive UI review and contrast checks |
| Single simple UI | Basic UI | Usability tests; implement missing navigation |
| Secure signup/signin | Local basic auth | Email verification, recovery, 2FA, independent security audit |
| Multi-company + permissions | Partial | Full role coverage and tenant isolation tests |
| Journal, double entry, trial balance | Basic + tested cases | Locks, reversals, audit coverage, accounting review |
| Sales/purchase/GST invoice | Basic | Returns, credit notes, recurring billing, full tax scenarios |
| FIFO inventory | Whole units, basic | Warehouses, transfers, returns, decimal quantity cases |
| GST filing preparation | Provisional report only | Rules by effective date, HSN and ITC verification; no filing integration |
| 42 financial reports | Limited core set | Implement each requested report with reconciling tests |
| Excel-like spreadsheet | Limited formula interpreter | Import/export XLSX, more functions, formatting, worksheets |
| Financial mathematics | Additional tested integer helpers | Integrate into APIs, expand approved formulas and conventions |
| AI accountant | Deterministic read-only queries | Provider adapter, user approval and tool validation |
| Photo/voice/video document ingestion | Not implemented | Upload service, parsing, OCR/transcription services and review UI |
| Private RAG knowledge, corrections | Not implemented | Per-tenant indexing and approved correction rules |
| Banking reconciliation | Not implemented | Statement import, reconciliation and approvals |
| Subscriptions + payment gateway | Catalog only, no checkout | Verified provider webhooks, invoices, refunds, trials |
| Platform owner revenue analytics | No verified billing | Correct separation of SaaS vs client ledgers |
| Android APK, Windows EXE | Not implemented | Build configurations, signed distribution and platform QA |
| Security + backup/restore | Partial local prototype | Threat model, backups, restore tests, production hardening |
| CI & reproducible build | Node test workflow | Integration/E2E CI and deploy pipeline |

Do not mark a feature complete merely because a route, menu label or prompt mentions it. All sensitive financial workflows require proper independent verification before production use.
