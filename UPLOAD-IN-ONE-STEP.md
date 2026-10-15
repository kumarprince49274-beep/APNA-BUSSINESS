# APNA BUSINESS — Sirf naye/badle GitHub-upload files (TEXT AI)

**Date:** 15 October 2026  
**Compared against:** public GitHub `kumarprince49274-beep/APNA-BUSSINESS` `main`, reviewed source commit `256540ed7639d2c3e65d7e1b709e3b32e39be7dc`.  
**This is a PATCH:** original unchanged `src/`, `public/`, `test/`, `scripts/` files are intentionally missing here. Keep them in GitHub.  
**Do not use as stand-alone source:** this ZIP must be MERGED with the existing repository at its root.

## Ek baar mein GitHub upload (without deleting old files)

1. GitHub par apna existing repository `https://github.com/kumarprince49274-beep/APNA-BUSSINESS` kholiye.
2. **Avoid direct upload to `main` when Render auto-deploys.** Branch dropdown → create a new branch named `apna-text-ai-test` from `main`.
3. This ZIP ko Windows laptop par **Extract All** kijiye.
4. Extracted folder ke ANDAR ki sab files aur folders (`src`, `public`, `test`, `scripts`, `package.json`, etc.) ek sath select karke **GitHub repo ke ROOT** par **Add file → Upload files** window mein drag-drop kijiye. Existing same-path files GitHub par **replace/update** hongi; new paths add honge. Other old files untouched rahengi. **ZIP ko seedha repository mein upload mat kijiye: GitHub ZIP ko auto-extract nahi karta.**
5. Changes compare karke ek commit banaiye. `Actions` tab me automated tests pass hone ka wait kijiye. Phir local test + privacy/security check; uske baad hi production merge decide kijiye.
6. **Never upload** `data/`, `backups/`, `.env`, real passwords, invoices or API keys. `.env.example` safe placeholder only.

If the repository has changed after the SHA listed above, compare/reconcile before replacing overlapping files.

## Local Windows test (recommended before any live deployment)

Inside local COMPLETE repository with these changes merged, run:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run demo
npm.cmd run demo:start
```

Then open `http://127.0.0.1:3001`. The demo creates a separate database `data/apna-demo.sqlite` only on first run; does not overwrite existing demo records. For demo account/password details, open `DEMO-START-HERE.md`.

## What you will actually get

- **TEXT AI chat as default after company creation**: works in LOCAL VERIFIED read-only mode without API key (limited questions about authorized accounting and tasks); optional OpenAI API for freer Hindi/Hinglish text responses. Real AI requires external provider key, API account/billing, and user Privacy opt-in. Only permission-allowlisted company summary goes to API, not uploaded files or salaries.
- Company selection, separate logins, profile, optional mobile/address, task activity, basic department workflow demo; GST registration types with basic tax behavior; existing accounting engine retained.
- **Payroll DRAFT calculation/approval**, NOT bank payment, employee tax compliance, PF/ESI deductions or official payslips.
- **GST PREPARATION/REVIEW**, NOT GSTN portal submission, official GSTR filing or regulatory certification.
- **OPTIONAL Razorpay one-time 30-day payment-link code** with provider-side verification; NOT automatic recurring subscription, live-tested merchant onboarding or production security certification. Without credentials the feature is disabled.
- Saved photos/PDF/voice documents in existing Files library, but **NO multimodal AI understanding/transcription** in this TEXT-only upgrade.

**IMPORTANT:** `npm test` checks software behavior but DOES NOT establish legal, accounting, privacy or payment production readiness. Old broad read-access endpoints need additional least-privilege review. Render ephemeral SQLite is NOT durable for real customers.
