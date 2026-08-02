# FinanceSarthi CI/CD Pipeline & DevOps Manual

This document details the CI/CD pipeline design, workflows stages, secret variables setup, and deployment processes.

---

## 🏛️ CI/CD Workflow Architecture

```
[ Developer Branch ]
         │
         ▼  (Create Pull Request)
┌──────────────────────────────────────────────┐
│  Pull Request Verification Workflow (ci.yml)  │
│  - Setup Node 22 & Restore Cache             │
│  - Code style formatting checks (ESLint)      │
│  - Validation & Math Calculations tests      │
│  - Production compilation check (`npm run build`)│
└──────────────────────┬───────────────────────┘
                       │
                       ▼  (PR Merged to main)
┌──────────────────────────────────────────────┐
│  Production Deployment Workflow (deploy.yml)  │
│  - Re-verify Quality Gates                   │
│  - Build workspaces                          │
│  - Deploy release to Vercel                   │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Pipeline Stages

1. **Checkout & Setup**: Fetches code and configures Node 22.
2. **Caching**: Restores the `node_modules` and npm cache based on `package-lock.json` hash keys.
3. **Lint Verification**: Executes ESLint verification checks to guarantee standard styling rules.
4. **Calculations & Validation Tests**: Runs system integration checks checking mathematical compound yields, validation enums, XSS sanitization, and security rule validations.
5. **Build Verification**: Builds production-ready React client assets and Node.js backend files.
6. **Production Deployment**: Pushes built assets directly to Vercel for live hosting (CD workflow on `main`).

---

## 🧪 Running Verifications Locally

Prior to committing or pushing code, run the verification gates locally:

```bash
# 1. Run ESLint checks
npm run lint

# 2. Run test suites
npx ts-node apps/backend/src/tests/calculations.test.ts
npx ts-node apps/backend/src/tests/validation.test.ts
npx ts-node apps/backend/src/tests/expense-validation.test.ts
npx ts-node apps/backend/src/tests/income-system.test.ts

# 3. Verify production compilation builds
npm run build
```

---

## 🔒 Configuration of Secrets

Set the following secrets in your GitHub Repository settings (`Settings > Secrets and variables > Actions`):

| Secret Key | Description | Required For |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Personal Access Token generated in Vercel Account settings | Vercel CLI Authentication |
| `VERCEL_ORG_ID` | Owner/Org ID on Vercel | Deployment Targeting |
| `VERCEL_PROJECT_ID` | Project ID linked to FinanceSarthi | Deployment Targeting |

---

## 🛡️ Recommended Branch Protection Rules

To prevent broken code or skipped checks from reaching `main`, we recommend configuring these protection rules on the `main` branch:

1. **Require a Pull Request before merging**: Force all changes to go through PR reviews.
2. **Require status checks to pass before merging**: Check the boxes for `Verify Quality Gates` to block merges if tests fail.
3. **Require approvals**: Require at least 1 approval before a pull request can be merged.
4. **Restrict force pushes**: Disable force pushing or deletion of the `main` branch.
