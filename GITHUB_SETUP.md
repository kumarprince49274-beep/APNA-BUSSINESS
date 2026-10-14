# APNA BUSINESS — GitHub setup (current complete source)

This ZIP includes the current local accounting foundation + returns + bank reconciliation + green/gold screenshot-style interface + email/password user accounts + private local company file library. It is **not** the live Replit source export, a secure public SaaS, or a Render production deployment.

1. Extract the ZIP. You should see `package.json`, `public/`, `src/`, `test/`, `docs/`, and `.github/` immediately.
2. Keep an offline backup of `data/` if updating an existing app; stop the server before making the backup. **Do not delete your SQLite database.**
3. Create/use a PRIVATE GitHub repository and upload the *contents* of the extracted folder. Never upload business records, `.env`, or `data/`.
4. Confirm source folders exist in GitHub, not just the README. Verify Actions tests and local browser navigation.
5. On Windows, run `npm.cmd install`, `npm.cmd test`, `npm.cmd run dev` inside the project folder.
6. Open `http://127.0.0.1:3000/` and verify email login, company creation, page navigation, Files uploads, and Settings/password change.

Read `docs/FINAL-LOGIN-FILES-NAVIGATION-UPDATE.md` for exact feature limitations. Uploaded PDFs and voice notes are stored locally, not analyzed by AI. Browser microphone permission is required to record voice notes.
