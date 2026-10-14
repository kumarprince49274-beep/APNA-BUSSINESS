# APNA BUSINESS — Latest Complete Source

1. Extract the complete ZIP to your Windows PC; it contains independent src/, public/, test/, docs/ and .github/ folders. Do not upload ZIP alone.
2. If you already have accounting data, STOP the server and back up your existing `data/` folder. DO NOT replace/delete existing SQLite database.
3. For updating existing project, copy/merge the extracted source code while preserving `data/` and `.env`.
4. For new GitHub repository, create a PRIVATE repo, commit extracted source code files and folders, then check GitHub Actions for test results. Never commit .env or data/.
5. With Node.js 22.13+ inside the project folder, run `npm install`, `npm test`, `npm run dev`. On PowerShell where scripts are blocked, run `npm.cmd test` and `npm.cmd run dev`.
6. In browser open http://127.0.0.1:3000. Register, create a company, navigate all pages, and test files upload/recording with synthetic data.
7. For precise feature and limitations read docs/FINAL-LOGIN-FILES-NAVIGATION-UPDATE.md. This is not production-ready or Render-ready for real accounting data.
