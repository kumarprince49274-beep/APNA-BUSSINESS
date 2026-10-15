> Historical snapshot: this note may describe an earlier build. See `docs/STAGES-3-9-CURRENT-STATUS.md` for current status.

# APNA BUSINESS — Reviewed source and GitHub upload instructions

Reviewed on 2026-10-14 against the user's current `APNA-BUSSINESS` GitHub repository.

## Confirmed changes

- Fixed a real authentication reliability bug: 20 successful logins could accidentally activate the failed-attempt login lockout. Login throttling now counts failed authentication only, resets on success and expires after 15 minutes.
- Safely check static files before streaming, and handle stream failures.
- Added `test/server-reliability.test.js` covering repeated successful logins, 20 failed logins and static frontend resources.
- Corrected obsolete README documentation which wrongly described the local file library as disabled and reported 22 tests. The present reviewed package passes **27 automated tests** on Node.js 22.16.0.
- Preserved previous accounting, UI, voice-note and document functionality.

## GitHub repository status

Repository: https://github.com/kumarprince49274-beep/APNA-BUSSINESS (main). GitHub connector reported `push=false` and `pull=true`, so **no source changes were uploaded automatically**. At review time the seven original root setup files were present, but the source directories were missing. Root `README.md` needs replacement to reflect the reviewed build.

Use `APNA-BUSINESS-GITHUB-MISSING-AND-FIXED.zip` to upload only missing source folders + updated `README.md`. Unpack and upload the contents; GitHub's plain file upload does not extract ZIP archives. When the site detects `README.md` already exists, confirm replacement or upload via GitHub Desktop commit. The ZIP is flat at repository root: do not create an extra containing folder.

Alternatively, the complete `APNA-BUSINESS-REVIEWED-FULL-SOURCE.zip` contains every source file for local installation. **Never upload `data/`, `.env`, private records or API keys**. Do not change database contents, reset SQLite or remove existing accounts. Stop your local server before backing up its `data/` folder, which also contains uploaded documents.

## What remains

- Source code is still missing from the remote GitHub repository until uploaded and committed by an account with write access.
- Actual end-user browser/UI and microphone checks should be repeated on the user's computer. The container Chromium test was blocked by its administrator; no claim of a new full real-browser pass is made for this code review.
- OCR, voice transcription, email-based password reset, real AI and payments, full GST treatment and a secure public SaaS are not implemented.
- A public repo is visible; change it to Private in GitHub settings if you need the source kept non-public.
