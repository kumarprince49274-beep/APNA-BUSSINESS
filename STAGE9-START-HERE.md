# APNA BUSINESS — Stage 9 Upload

This is the next patch after the Stage 8 GST-optional + Text-AI + AI sale-draft release.

## Upload this ZIP

`APNA-BUSINESS-STAGE9-AI-DOCUMENT-REVIEW-ONE-UPLOAD.zip`

Extract it first. Upload the extracted files while preserving their paths. This patch contains only NEW/CHANGED files. Do not upload the ZIP as a single repository file.

## Changed/new paths

- `src/ai-document-review.js` — NEW
- `src/server.js` — adds AI document-review routes
- `public/app.js` — makes the existing AI Review button functional
- `test/ai-document-review.test.js` — NEW
- `package.json` — version 0.9.0
- `docs/STAGE9-AI-DOCUMENT-REVIEW.md` — release notes

## Before upload

Back up `data/` and keep `.env` private. Do not upload `data/`, `backups/`, API keys or real business documents.

## Verification

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Validated locally: **63/63 tests passed** on Node.js 22.16.0.
