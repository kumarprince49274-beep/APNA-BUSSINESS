# APNA BUSINESS — Two ZIP choices

**If you have NOT uploaded the previous Text-AI ZIP to GitHub:** use the `APNA-BUSINESS-ALL-UPDATES-FROM-GITHUB-BASE.zip` package. It combines Text AI, demo/permissions, payroll/GST source review/SaaS checkout and the new advanced ERP work into one upload.

**If you HAVE uploaded the previous Text-AI ZIP to GitHub:** use `APNA-BUSINESS-ERP-ONLY-NEXT-STAGE-CHANGES.zip` package. It contains only the new changes since that previous ZIP, not every old source file.

**If you want to run locally without merging:** use `APNA-BUSINESS-ADVANCED-ERP-FULL-SOURCE.zip`. It includes all code and scripts.

## Very important before upload

- These ZIPs are **source distributions**, not a runnable installer or a GitHub Action that automatically updates an app.
- Extract the chosen ZIP and upload its **contents preserving the `src/`, `public/`, `test/`, `scripts/`, `docs/` folders**. Uploading the `.zip` archive itself to GitHub as one file will not install the code.
- Work on a fresh **testing branch**, not `main`; review the changes then run GitHub Actions and local smoke tests before merge.
- Never upload `data/`, `backups/`, `.env`, customer records, password tokens, merchant keys or AI API keys. The archives deliberately exclude the data folder and live credentials.
- Save a consistent backup of the existing SQLite database (and `-wal` / `-shm` handling) before upgrading. Do not delete old files or reset the DB just to make new schema work.
- Use a PRIVATE repository and staged hosting; on Render free instance an ephemeral SQLite file may disappear after restart/deploy. This is not a production-safe deployment.
- These builds were tested with Node 22.16.0 and the local automated test runner; not legally certified.

## Local test (Windows PowerShell)

```powershell
npm.cmd install
npm.cmd test
npm.cmd run demo
npm.cmd run demo:start
```

Open `http://127.0.0.1:3001` and log in with the **synthetic owner account** `owner@demo.apna.test` / `Demo@2026Safe!`. Never put these sample logins on a public server. To run clean without sample accounts: `npm.cmd run dev` and open `http://127.0.0.1:3000`.

## What remains external/unimplemented

**Official GST filing**, statutory payroll remittance/compliance, real end-to-end manufacturing stock/cost posting, true recurring paid SaaS, production-grade durable storage and public-user security are NOT complete. `docs/ADVANCED-ERP-RELEASE-NOTES.md` distinguishes everything delivered from everything still needed.
