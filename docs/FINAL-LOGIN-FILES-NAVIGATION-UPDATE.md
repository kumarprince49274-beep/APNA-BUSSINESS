# APNA BUSINESS — Account, Navigation, Logo, Local Files update

This patch preserves the existing verified accounting engine, reference-style green/cream UI, and company data schema.

## Features
- Registration: choose your own password, confirm it; email + password login; show/hide button. Passwords are salted/scrypt-hashed, never returned to browser.
- Account Settings: change password after verifying current password (other sessions invalidated). Email recovery and outbound reset links NOT implemented.
- Sidebar: navigation handler retains all existing pages; missing company prompts setup instead of silently failing, page-load errors are visible.
- Logo: gold-background dark-green pulse symbol for favicon, aligned to header mark. This is a locally drawn vector glyph, not the original Replit private file.
- Files: private *per company* local SQLite storage for PDF, PNG/JPEG/WebP, TXT, DOC/DOCX, recorded WebM/OGG/M4A audio, up to 5MB each, 100 files/50MB per company. File listing and download, browser preview where supported for PDF/images/plain text, delete for Owner/Accountant/Manager. Upload available to Owner/Accountant/Manager/Sales, Viewer read-only.
- Browser recording requires microphone permission and a supported browser (MediaRecorder, secure context / localhost).

## Limits and safety
- No OCR, AI photo analysis, Word in-browser reader, audio transcription, cloud sync or third-party file integration. Word files download. No external AI services receive data. Uploaded files are stored *on the same host as the application server*, not exclusively in browser storage.
- `.sqlite` database includes files; stop server before copying `data/` for backup. The file-library feature needs encrypted-at-rest storage, malware scanning, detailed auditing and security review before online production use.
- Admin roles and CSRF are verified server-side. File type is checked by extension/basic signature; this is NOT enterprise-grade malware filtering.
- Existing registered accounts and records remain preserved if using the same SQLite DB. A ZIP does NOT include data.

## Local verification
Run `npm install`, `npm test`, `npm run dev`; open http://127.0.0.1:3000. Register with your email, password (12+ chars), create a company, click each sidebar page, upload a safe test PDF or image, download it, try recording, change password from Settings.
