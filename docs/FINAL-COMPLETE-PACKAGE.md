> Historical snapshot: this note may describe an earlier build. See `docs/STAGES-3-9-CURRENT-STATUS.md` for current status.

# APNA BUSINESS — Complete current source archive

This is the full local developer project, not an incremental patch. It preserves existing accounting features and the screenshot-inspired cream/dark-green/gold UI.

## New improvements
- Email registration and login with user-defined password (12+ characters), confirmation and Show/Hide.
- Change password in Settings with current-password verification and invalidation of other sessions.
- Matching pulse logo favicon and an expanded More Business Tools sidebar; page-load errors are surfaced.
- Private local company library for PDF, PNG/JPEG/WebP, TXT, Word, and voice recordings, with list/download/delete. Size: 5 MB/file, 50 MB and 100 files/company. Some file types have limited browser previews.
- Code verified in this session: 27 automated tests passed, zero failed; mock-browser navigation for 14 pages passed without JavaScript errors. These checks do NOT mean the app is production ready and microphone behavior still depends on your browser/device.

## Update on your Windows laptop
1. Stop the server with Ctrl+C in VS Code Terminal.
2. Back up the existing `data/` folder after stopping the server. It holds ALL business records, registered accounts and saved private files. The source ZIP contains no business records.
3. Extract the ZIP and replace application SOURCE files/folders in your project. Preserve your existing `data/` directory, `.env`, and secrets. Never delete or reset your SQLite database while upgrading.
4. In the folder containing `package.json`, run `npm.cmd install`, `npm.cmd test`, and `npm.cmd run dev` one by one.
5. Open http://127.0.0.1:3000 and hard-refresh (Ctrl+Shift+R) if necessary. Test email login, create a company, click each page, test file uploads and the Settings password update using fictional data.

## Upload to GitHub
Extract and upload the real folders and individual files (`src/`, `public/`, `test/`, `docs/`, `.github/` etc.) to a PRIVATE repo; never upload ZIP alone expecting GitHub to extract it. Never commit `data/`, `.env`, keys or passwords.

## Limitations
- Files are stored in the application's local SQLite DB, not only inside the browser; no files go to an external AI service in this edition. No OCR, Word reading, AI image extraction, or voice transcription. Word is downloaded for viewing externally.
- Browser voice recording requires microphone permissions, secure context or localhost, and MediaRecorder support.
- This local file library has basic extension/signature checks; it is not a production-hardened malware scanner, cloud backup, or secure public SaaS storage layer.
- No email-based password recovery, real recurring payment service, production tax filing, Android APK/Windows EXE, or secure public Render deployment in this source snapshot.
- This is newly authored starter code; not a verified export of the older private Replit app.
