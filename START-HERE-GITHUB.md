# START HERE — APNA BUSINESS

**Only one ZIP is required** for the whole current source project. Extract it; upload `public/`, `src/`, `test/`, `docs/`, `.github/`, `package.json` and other root files as separate paths to a PRIVATE GitHub repository.

For existing installations: Back up `data/` while the server is stopped and preserve that folder; it contains your accounts and locally saved files. The source ZIP does not include this data. Do not publish or share `data/` or `.env`.

Windows / VS Code Terminal in the extracted project folder:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Visit `http://127.0.0.1:3000/` while Terminal remains running. Register/Login with your own email/password (12+ characters); create your business first, then open each menu. In Files you can upload test documents and record audio using a supported microphone browser.

If browsers show old styles, hard refresh Ctrl+Shift+R. For feature limits and safety guidance see `docs/FINAL-LOGIN-FILES-NAVIGATION-UPDATE.md`. No real bank integrations, payment gateway, OCR, AI transcription, or production cloud deployment included.
