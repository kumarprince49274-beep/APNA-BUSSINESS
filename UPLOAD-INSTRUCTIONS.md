# APNA BUSINESS — GST + Non-GST Fix

This patch fixes the first onboarding/tax-mode problem from the current source ZIP.

## Replace / upload these files

- `public/app.js`
- `src/companies.js`
- `src/invoices.js`
- `src/schema.sql`
- `src/server.js`
- `test/onboarding-gst.test.js` (new)

## What changes

1. Create Company now has a Business State / UT dropdown.
2. GST Registration has:
   - I don't have GST registration
   - GST Regular
   - GST Composition
   - Other GST Registration Type
3. Non-GST mode hides GSTIN, does not require GSTIN, and invoice GST is 0.
4. Regular GST mode requires GSTIN and checks that the GSTIN starts with the selected state code.
5. Company GST mode is stored in `company_settings`.
6. Existing companies are backfilled without deleting accounting history.
7. Existing invoice tests and accounting behavior remain compatible.

## Important

Back up `data/` before replacing source files. Do not delete the database.

After upload, run:

`npm.cmd test`

The reviewed patch passed **33/33 tests** on Node.js 22.16.0.

Then hard-refresh the browser with `Ctrl+Shift+R` and test both modes.
