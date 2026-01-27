# CI/CD Pipeline Documentation

This document explains the CI/CD workflows set up for the SYS-TEMPLATE project using GitHub Actions.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
  - [Backend CI](#backend-ci)
  - [Frontend CI](#frontend-ci)
  - [Security Scan](#security-scan)
  - [Staging Deployments](#staging-deployments)
  - [Production Deployments](#production-deployments)
- [Required GitHub Secrets](#required-github-secrets)
- [Workflow Triggers](#workflow-triggers)
- [Pipeline Flow](#pipeline-flow)
- [How to Deploy](#how-to-deploy)
- [Environment Protection Rules](#environment-protection-rules)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CI/CD pipeline consists of:

1. **Continuous Integration (CI)**: Automated testing, linting, and security scanning on pull requests
2. **Continuous Deployment (CD)**: Automated staging deployments on merges to main
3. **Manual Production Deployment**: Gated production releases with approval requirements
4. **Automated Dependency Management**: Dependabot for security updates and version bumps

### Pipeline Architecture

```
┌─────────────────┐
│   Pull Request  │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Backend │
    │   CI    │
    └────┬────┘
         │
    ┌────▼────┐
    │Frontend │
    │   CI    │
    └────┬────┘
         │
    ┌────▼────┐
    │Security │
    │  Scan   │
    └────┬────┘
         │
    ┌────▼────┐
    │  Merge  │
    │  to     │
    │  main   │
    └────┬────┘
         │
    ┌────▼────────────────┐
    │  Auto Deploy to     │
    │  Staging            │
    │  (Heroku + Netlify) │
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │  Manual Production  │
    │  Deploy with        │
    │  Approval           │
    └─────────────────────┘
```

---

## Workflows

### Backend CI

**File**: `backend-ci.yml`

**Purpose**: Ensures backend code quality, test coverage, and code style compliance.

**Triggers**:
- Pull requests affecting backend code
- Pushes to `main` branch affecting backend code

**Path filters**:
- `backend/**`
- `requirements.txt`
- `.github/workflows/backend-ci.yml`

**Jobs**:

1. **Lint with Ruff** (`lint`)
   - Sets up Python 3.11.6
   - Installs dependencies with pip caching
   - Runs `ruff check .` for linting (blocking)
   - Runs `ruff format --check .` for formatting (non-blocking)

2. **Run Tests** (`test`)
   - Sets up Python 3.11.6
   - Installs dependencies
   - Runs pytest with coverage (`pytest --cov`)
   - Uploads coverage to Codecov
   - Uploads HTML coverage report as artifact (7-day retention)

**Artifacts**:
- `coverage-report`: HTML coverage report

---

### Frontend CI

**File**: `frontend-ci.yml`

**Purpose**: Validates frontend code through linting, building, and E2E testing.

**Triggers**:
- Pull requests to `main`, `master`, or `develop` branches
- Pushes to `main`, `master`, or `develop` branches

**Path filters**:
- `frontend/**`
- `.github/workflows/frontend-ci.yml`

**Jobs**:

1. **Lint and Build** (`lint-and-build`)
   - Sets up Node.js 20 with npm caching
   - Installs dependencies with `npm ci`
   - Runs ESLint (`npm run lint`)
   - Builds the project (`npm run build`)
   - Uploads build artifacts (7-day retention)

2. **E2E Tests** (`e2e-tests`)
   - Runs after `lint-and-build` completes
   - Installs Playwright browsers (chromium)
   - Builds frontend
   - Starts preview server in background
   - Runs Playwright tests (continues on error)
   - Uploads test results and reports

**Artifacts**:
- `frontend-build`: Production build output
- `playwright-test-results`: E2E test results and HTML reports

---

### Security Scan

**File**: `security-scan.yml`

**Purpose**: Scans dependencies for known security vulnerabilities.

**Triggers**:
- Pull requests changing dependency files
- Weekly schedule (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Path filters**:
- `requirements.txt`
- `frontend/package.json`
- `frontend/package-lock.json`
- `.github/workflows/security-scan.yml`

**Jobs**:

1. **Scan Python Dependencies** (`scan-python-dependencies`)
   - Sets up Python 3.11.6
   - Installs `pip-audit`
   - Scans for vulnerabilities in Python packages
   - Uploads JSON report (30-day retention)

2. **Scan NPM Dependencies** (`scan-npm-dependencies`)
   - Sets up Node.js 20
   - Runs `npm audit`
   - Uploads JSON report (30-day retention)

3. **Security Summary** (`security-summary`)
   - Runs after both scans complete
   - Downloads audit reports
   - Generates unified summary in GitHub Actions UI
   - Shows vulnerability counts by severity

**Artifacts**:
- `pip-audit-report`: Python vulnerability scan (30 days)
- `npm-audit-report`: NPM vulnerability scan (30 days)

**Schedule**: Every Monday at 9:00 AM UTC (`0 9 * * 1`)

---

### Staging Deployments

#### Backend Staging

**File**: `deploy-backend-staging.yml`

**Purpose**: Automatically deploys backend to Heroku staging when main branch is updated.

**Triggers**:
- Push to `main` branch

**Path filters**:
- `backend/**`
- `requirements.txt`
- `Procfile`
- `runtime.txt`
- `.github/workflows/deploy-backend-staging.yml`

**Steps**:
1. Checkout code
2. Deploy to Heroku using `akhileshns/heroku-deploy@v3.13.15`
3. Verify deployment
4. Run health check on `/health` endpoint

**Required Secrets**:
- `HEROKU_API_KEY`
- `HEROKU_APP_NAME` (staging app)
- `HEROKU_EMAIL`

#### Frontend Staging

**File**: `deploy-frontend-staging.yml`

**Purpose**: Automatically deploys frontend to Netlify staging when main branch is updated.

**Triggers**:
- Push to `main` branch

**Path filters**:
- `frontend/**`
- `.github/workflows/deploy-frontend-staging.yml`

**Steps**:
1. Checkout code
2. Setup Node.js 20 with npm caching
3. Install dependencies (`npm ci`)
4. Build frontend with staging API URL
5. Deploy to Netlify using `nwtgck/actions-netlify@v3.0`
6. Add deployment comment to commit

**Required Secrets**:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID` (staging site)
- `VITE_API_URL_STAGING` (optional, has default)

**Note**: Uses `production-deploy: false` for staging environment

---

### Production Deployments

#### Backend Production

**File**: `deploy-backend-production.yml`

**Purpose**: Manually deploy backend to Heroku production with approval gate.

**Trigger**: Manual workflow dispatch only

**Required Input**:
- `reason`: Deployment reason (required for audit trail)

**Environment**: `production` (enables approval requirement)

**Steps**:
1. Log deployment reason and triggering user
2. Deploy to Heroku production app
3. Verify deployment
4. Run health check

**Required Secrets**:
- `HEROKU_API_KEY`
- `HEROKU_PROD_APP_NAME` (production app)
- `HEROKU_EMAIL`

**Approval Gate**: Configured via GitHub Environment protection rules

#### Frontend Production

**File**: `deploy-frontend-production.yml`

**Purpose**: Manually deploy frontend to Netlify production with approval gate.

**Trigger**: Manual workflow dispatch only

**Required Input**:
- `reason`: Deployment reason (required for audit trail)

**Environment**: `production-frontend` (enables approval requirement)

**Steps**:
1. Checkout code
2. Setup Node.js and install dependencies
3. Build with production API URL
4. Deploy to Netlify with `production-deploy: true`
5. Add deployment comment

**Required Secrets**:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID` (production site)
- `VITE_API_URL_PRODUCTION` (optional, has default)

**Approval Gate**: Configured via GitHub Environment protection rules

---

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Backend Deployment

| Secret | Description | Used By |
|--------|-------------|---------|
| `HEROKU_API_KEY` | Heroku API key for deployments | Backend staging & production |
| `HEROKU_APP_NAME` | Heroku app name for staging | Backend staging |
| `HEROKU_PROD_APP_NAME` | Heroku app name for production | Backend production |
| `HEROKU_EMAIL` | Email associated with Heroku account | Backend staging & production |

### Frontend Deployment

| Secret | Description | Used By |
|--------|-------------|---------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token | Frontend staging & production |
| `NETLIFY_SITE_ID` | Netlify site ID for staging | Frontend staging |
| `NETLIFY_SITE_ID` | Netlify site ID for production | Frontend production |
| `VITE_API_URL_STAGING` | Backend API URL for staging (optional) | Frontend staging |
| `VITE_API_URL_PRODUCTION` | Backend API URL for production (optional) | Frontend production |

### How to Get Secrets

**Heroku**:
1. Log in to Heroku Dashboard
2. Go to Account Settings > API Key
3. Copy the API key
4. Get app names from your Heroku dashboard URL

**Netlify**:
1. Log in to Netlify
2. Go to User Settings > Applications > Personal access tokens
3. Generate a new token
4. Get Site ID from Site Settings > General > Site details

---

## Workflow Triggers

### Automatic Triggers

| Event | Workflows Triggered |
|-------|-------------------|
| Pull request to main | Backend CI, Frontend CI, Security Scan (if dependencies changed) |
| Push to main | Backend CI, Frontend CI, Backend Staging Deploy, Frontend Staging Deploy |
| Weekly schedule (Monday 9 AM UTC) | Security Scan |
| Dependabot PRs | All CI workflows based on changed files |

### Manual Triggers

| Workflow | How to Trigger |
|----------|---------------|
| Backend Production Deploy | Actions tab > "Deploy Backend to Heroku Production" > Run workflow |
| Frontend Production Deploy | Actions tab > "Deploy Frontend to Netlify Production" > Run workflow |
| Security Scan | Actions tab > "Security Scan" > Run workflow |

---

## Pipeline Flow

### Development Flow

```
1. Developer creates feature branch
2. Makes changes to code
3. Opens pull request to main
4. GitHub Actions automatically runs:
   - Backend CI (if backend files changed)
   - Frontend CI (if frontend files changed)
   - Security Scan (if dependency files changed)
5. All checks must pass (green) before merge
6. Reviewer approves PR
7. PR is merged to main
```

### Staging Deployment Flow

```
1. PR merged to main branch
2. GitHub Actions automatically triggers:
   - Backend staging deployment (if backend changed)
   - Frontend staging deployment (if frontend changed)
3. Deployments run in parallel
4. Health checks verify deployments
5. Staging environment updated
```

### Production Deployment Flow

```
1. Team decides to deploy to production
2. Navigate to Actions tab in GitHub
3. Select production deployment workflow:
   - "Deploy Backend to Heroku Production"
   - "Deploy Frontend to Netlify Production"
4. Click "Run workflow"
5. Enter deployment reason (required for audit)
6. Submit workflow
7. Workflow waits for manual approval (if configured)
8. Approver reviews and approves deployment
9. Deployment executes
10. Health check verifies production deployment
```

---

## How to Deploy

### Deploy to Staging

**Staging deployments are automatic** when you merge to `main`:

1. Create and test your changes in a feature branch
2. Open a pull request to `main`
3. Wait for CI checks to pass
4. Get PR approval
5. Merge PR to `main`
6. GitHub Actions automatically deploys to staging

**What gets deployed**:
- Backend changes → Heroku staging
- Frontend changes → Netlify staging
- Both if both are changed

### Deploy to Production

**Production deployments require manual trigger**:

#### Backend Production

1. Go to GitHub repository → Actions tab
2. Select "Deploy Backend to Heroku Production"
3. Click "Run workflow" button
4. Fill in deployment reason (e.g., "Deploying user authentication fix")
5. Click "Run workflow"
6. If approval is required, wait for approver
7. Monitor deployment in Actions tab

#### Frontend Production

1. Go to GitHub repository → Actions tab
2. Select "Deploy Frontend to Netlify Production"
3. Click "Run workflow" button
4. Fill in deployment reason (e.g., "Deploying UI improvements")
5. Click "Run workflow"
6. If approval is required, wait for approver
7. Monitor deployment in Actions tab

---

## Environment Protection Rules

To enable manual approval gates for production deployments:

### Setup Instructions

1. Go to repository **Settings** → **Environments**
2. Create environment `production` (for backend)
3. Create environment `production-frontend` (for frontend)
4. For each environment, configure:
   - ✅ **Required reviewers**: Add team members who can approve
   - ✅ **Wait timer**: Optional delay before deployment (e.g., 5 minutes)
   - ✅ **Deployment branches**: Restrict to `main` branch only

### Recommended Settings

```yaml
Environment: production
├─ Required reviewers: 1+ team leads
├─ Wait timer: 0 minutes
└─ Allowed branches: main

Environment: production-frontend
├─ Required reviewers: 1+ team leads
├─ Wait timer: 0 minutes
└─ Allowed branches: main
```

**Note**: Without environment protection rules configured, production deployments will run immediately without approval.

---

## Troubleshooting

### Common Issues

#### CI Checks Failing

**Backend tests failing**:
```bash
# Run tests locally to debug
cd backend
pytest --cov=. --cov-report=term-missing
```

**Frontend linting errors**:
```bash
# Run linter locally
cd frontend
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Backend linting errors**:
```bash
# Check issues
cd backend
ruff check .

# Auto-fix issues
ruff check . --fix

# Check formatting
ruff format --check .

# Apply formatting
ruff format .
```

#### Deployment Failures

**Heroku deployment fails**:
- Verify `HEROKU_API_KEY` is valid
- Check `HEROKU_APP_NAME` matches actual Heroku app
- Review Heroku logs: `heroku logs --tail --app=<app-name>`
- Verify `Procfile` and `runtime.txt` are correct

**Netlify deployment fails**:
- Verify `NETLIFY_AUTH_TOKEN` is valid
- Check `NETLIFY_SITE_ID` matches actual site
- Ensure build succeeds locally: `cd frontend && npm run build`
- Check Netlify deploy logs in Netlify dashboard

**Health check fails**:
- Verify `/health` endpoint exists in backend
- Check if app is starting correctly (Heroku logs)
- Increase sleep time in workflow if app takes longer to start

#### Security Scan Issues

**False positives**:
- Review vulnerability details in artifact reports
- If safe to ignore, document in security policy
- Consider pinning versions temporarily

**Vulnerable dependencies**:
- Review Dependabot PRs for automated fixes
- Update manually: `pip install --upgrade <package>` or `npm update <package>`
- Check if patches are available

#### Approval Gate Not Working

- Verify environment protection rules are configured
- Check environment name matches workflow (`production`, `production-frontend`)
- Ensure approvers are added to environment settings
- Confirm approver has correct repository permissions

#### Workflow Not Triggering

**Check triggers**:
- Verify files changed match path filters
- Confirm branch name matches trigger configuration
- For manual workflows, use "Run workflow" button

**Debug steps**:
```bash
# Check which files changed
git diff --name-only HEAD~1

# Verify branch name
git branch --show-current
```

### Getting Help

1. **Check workflow logs**: Actions tab → Select workflow run → View logs
2. **Review error messages**: Look for specific error in failed step
3. **Verify secrets**: Settings → Secrets and variables → Actions
4. **Test locally**: Run commands from workflow on your machine
5. **Check status page**:
   - GitHub Status: https://www.githubstatus.com/
   - Heroku Status: https://status.heroku.com/
   - Netlify Status: https://www.netlifystatus.com/

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Deployment Guide](https://devcenter.heroku.com/categories/deployment)
- [Netlify Deployment Documentation](https://docs.netlify.com/site-deploys/overview/)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

---

## Maintenance

### Regular Tasks

- **Weekly**: Review Dependabot PRs and merge updates
- **Weekly**: Check security scan results (automatic on Mondays)
- **Monthly**: Verify all workflows are running successfully
- **Quarterly**: Review and update GitHub Actions versions
- **As needed**: Update secrets when credentials rotate

### Workflow Updates

When modifying workflows:

1. Test in a separate branch first
2. Use `workflow_dispatch` for manual testing
3. Monitor the first few runs carefully
4. Document changes in commit message
5. Update this README if behavior changes

---

**Last Updated**: January 2026
**Maintained By**: Development Team
