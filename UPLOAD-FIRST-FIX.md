# APNA BUSINESS — FIRST FIX: GST + NON-GST COMPANY CREATION

This patch is for the first onboarding fix only.

Included:
- public/app.js — Create Company UI with Business State dropdown, Business Type, GST Registration choice and conditional GSTIN.
- src/companies.js — backend validation/storage for UNREGISTERED, REGULAR, COMPOSITION and OTHER.
- src/invoices.js — UNREGISTERED invoices use 0 GST; REGULAR uses product GST; unsupported special GST modes remain blocked.
- src/schema.sql — company_settings table with gst_type.
- test/accounting.test.js — onboarding/GST coverage.
- test/onboarding-chat-invoice.test.js — non-GST and sale-draft coverage.

IMPORTANT:
1. Back up data/ before replacing source files.
2. Do NOT upload data/, .env, backups/ or secrets.
3. Upload the extracted files preserving their exact paths. Do not upload this ZIP as a single GitHub source file.
4. Run: npm.cmd test
5. Then test:
   - Create company -> GST Registration = I do not have GST registration -> GSTIN hidden -> Create.
   - Create another company -> GST Regular -> enter matching GSTIN -> Create.
   - For Uttar Pradesh, select Uttar Pradesh (09); do not type 09 manually.
6. This does not make Composition/Other GST filing legally compliant. Those invoice workflows remain blocked until their specialized tax rules are implemented.

The source files in this ZIP are taken from the prepared APNA BUSINESS Non-GST + Text-AI update. They are full file replacements, not snippets.
