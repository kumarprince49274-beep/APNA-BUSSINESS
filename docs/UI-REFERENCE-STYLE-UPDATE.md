> Historical snapshot: this note may describe an earlier build. See `docs/STAGES-3-9-CURRENT-STATUS.md` for current status.

# APNA BUSINESS — Screenshot-inspired Interface Update

This update restyles the existing local APNA BUSINESS app. It is not a rebuild or export of the original Replit website.

## Scope

- Changed: public/index.html (new brand/sidebar/main header, theme toggle), public/style.css (design tokens, cards, responsive layout and dark mode), public/app.js (dashboard and Files UI, quick action modal, theme state, navigation copy).
- Updated: README.md.
- Added: this documentation and UPLOAD-ONLY-UI-PATCH.txt.
- Not changed: src/, test/, DB schema, package.json, API contracts.

## Design palette

- Warm Cream #F7F5EF
- Sidebar Dark Green #1F3B3C (slightly tuned from brand reference #234A40)
- Green primary button #337561
- Gold accent #C9A75F
- Charcoal #253238
- White #FFFFFF
- Sage #E8EFE9
- Light border #E4E4DD

The reference has been approximated with native CSS and SVG icons without fetching fonts or assets from third parties. Functional elements and verified accounting data take precedence over reproducing the source site's precise pixels. Page titles and button text may differ where the available functionality is different.

## Important honest limitations

1. Files section is UI-only, with upload/voice buttons disabled. It does not retain documents or voice notes.
2. The Reports page uses current local report endpoints, not the screenshot application's PDF generation. Do not claim the PDF button exists/works.
3. Transactions is a navigation label for the existing Sales & Purchases screen. More business tools retains the rest of the original app features.
4. Dashboard figures are all-time totals from saved records; never call them today's or this month's amounts without implementing date-scoped totals.
5. Dark mode preference uses browser-local nonfinancial storage only.
6. Do not use this development build for real GST filing, production payment processing, or public online deployment.

## Install patch

Back up the current code and stop the server. Replace the three `public/` files and the root README.md; add this document and the patch instruction file at the listed paths. Keep all remaining original files including `src/`, `test/` and all accounting data. Do not upload your SQLite `data/` directory or secrets to GitHub.

## Verify

1. Use Node.js 22.13 or newer.
2. Run `npm.cmd test` on Windows PowerShell. The unchanged 22 backend tests passed at package creation on Node 22.16.0.
3. Run `npm.cmd run dev`, then open `http://127.0.0.1:3000`.
4. Log in with a test account. Verify Overview light and dark themes, Transactions, Reports, Files disabled controls, More business tools, Record transaction chooser, and a full invoice workflow.
5. Tests for backend are not the same as an exhaustive live production/browser acceptance test.
