# CI/CD Pipeline End-to-End Verification Guide

This guide provides a comprehensive checklist for verifying the CI/CD pipeline implementation.

## 📋 Quick Checklist

### Pre-Verification Setup

**GitHub Secrets** (`Repository → Settings → Secrets and variables → Actions`):
- [ ] `HEROKU_API_KEY` - Your Heroku API key
- [ ] `HEROKU_EMAIL` - Your Heroku account email
- [ ] `HEROKU_APP_NAME` - Staging Heroku app name
- [ ] `HEROKU_PROD_APP_NAME` - Production Heroku app name
- [ ] `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- [ ] `NETLIFY_SITE_ID` - Staging Netlify site ID
- [ ] `NETLIFY_SITE_ID_PROD` - Production Netlify site ID

**Environment Protection** (`Repository → Settings → Environments`):
- [ ] Create `production` environment with required reviewers
- [ ] Create `production-frontend` environment with required reviewers

---

## 🧪 Phase 1: Pull Request CI Checks

### Create Test PR

```bash
git checkout -b test/ci-pipeline-verification
# Make small changes to backend and frontend files
echo "# CI Test" >> backend/README_TEST.md
echo "# CI Test" >> frontend/README_TEST.md
git add .
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline-verification
```

Then create a PR on GitHub and verify:

### Backend CI Workflow
- [ ] **Lint with Ruff** job completes successfully
  - Python 3.11.6 setup
  - `ruff check` runs (blocking)
  - `ruff format --check` runs (non-blocking)
- [ ] **Run Tests** job completes successfully
  - Pytest runs with coverage
  - Coverage reports uploaded
  - All tests pass

### Frontend CI Workflow
- [ ] **Lint and Build** job completes successfully
  - Node.js 20 setup
  - `npm run lint` passes
  - `npm run build` succeeds
  - Build artifacts uploaded
- [ ] **E2E Tests** job runs
  - Playwright tests execute
  - Test results uploaded

### Security Scan
- [ ] Backend security scan runs (`pip-audit`)
- [ ] Frontend security scan runs (`npm audit`)
- [ ] Vulnerability summary displayed
- [ ] Scan reports uploaded as artifacts

### PR Status
- [ ] All required checks listed on PR
- [ ] Status badges show results
- [ ] PR shows check status

---

## 🚀 Phase 2: Staging Deployment

Merge the test PR and verify:

### Backend Staging
- [ ] "Deploy Backend Staging" workflow triggers automatically
- [ ] Deploys to `HEROKU_APP_NAME`
- [ ] Health check passes
- [ ] Staging backend is accessible at Heroku URL
- [ ] API documentation loads: `https://[staging-app].herokuapp.com/docs`

### Frontend Staging
- [ ] "Deploy Frontend Staging" workflow triggers automatically
- [ ] Uses `production-deploy: false` (staging mode)
- [ ] Netlify deployment succeeds
- [ ] Preview URL is available
- [ ] Staging frontend loads correctly
- [ ] Frontend connects to backend API

---

## 🔐 Phase 3: Production Deployment

### Backend Production

1. Trigger workflow:
   ```
   Actions → Deploy Backend Production → Run workflow
   Deployment reason: "E2E verification test"
   ```

2. Verify:
   - [ ] Workflow shows "Waiting" status
   - [ ] Approval notification sent to reviewers
   - [ ] "Review pending deployments" button appears
   - [ ] Can approve deployment
   - [ ] Deployment resumes after approval
   - [ ] Audit trail logged (who, when, why)
   - [ ] Deploys to `HEROKU_PROD_APP_NAME`
   - [ ] Health check passes
   - [ ] Production backend accessible

### Frontend Production

1. Trigger workflow:
   ```
   Actions → Deploy Frontend Production → Run workflow
   Deployment reason: "E2E verification test"
   ```

2. Verify:
   - [ ] Workflow waits for approval
   - [ ] Uses `production-frontend` environment
   - [ ] Approval notification sent
   - [ ] Can approve deployment
   - [ ] Deployment resumes after approval
   - [ ] Uses `production-deploy: true`
   - [ ] Production API URL configured
   - [ ] Production frontend accessible
   - [ ] Connects to production API

---

## 📊 Phase 4: Status Badges

Visit repository homepage and verify:

- [ ] **Backend CI Badge**
  - Shows current status (passing/failing)
  - Links to `backend-ci.yml` workflow
  - Updates in real-time

- [ ] **Frontend CI Badge**
  - Shows current status
  - Links to `frontend-ci.yml` workflow
  - Updates in real-time

- [ ] **Security Scan Badge**
  - Shows current status
  - Links to `security-scan.yml` workflow
  - Updates in real-time

---

## 🔍 Phase 5: Additional Verification

### Dependabot
- [ ] Navigate to `Insights → Dependency graph → Dependabot`
- [ ] Verify Dependabot is enabled
- [ ] Check weekly update schedule (Mondays)
- [ ] Confirm PR grouping configuration

### Scheduled Security Scans
- [ ] Navigate to `Actions → Security Scan`
- [ ] Verify scheduled runs (Mondays at 9 AM UTC)
- [ ] Or manually trigger workflow
- [ ] Check scan results and artifacts

### Documentation
- [ ] `.github/workflows/README.md` is comprehensive
- [ ] All workflows documented
- [ ] Secret setup instructions clear
- [ ] Troubleshooting section helpful
- [ ] Main README.md includes CI/CD in stack table
- [ ] Status badges at top of README

---

## ✅ Final Checklist

| Component | Working |
|-----------|---------|
| Backend CI on PR | ☐ |
| Frontend CI on PR | ☐ |
| Security scan | ☐ |
| Backend staging auto-deploy | ☐ |
| Frontend staging auto-deploy | ☐ |
| Backend production approval gate | ☐ |
| Frontend production approval gate | ☐ |
| Status badges display | ☐ |
| Dependabot active | ☐ |
| Documentation complete | ☐ |

---

## 🐛 Troubleshooting

### CI Workflows Don't Trigger
- Check path filters in workflow files
- Verify workflow files are in `.github/workflows/`
- Ensure YAML syntax is valid
- Check GitHub Actions is enabled

### Deployment Fails
- Verify all required secrets are set
- Check secret names match workflow files
- Verify Heroku/Netlify apps exist
- Check app names are correct
- Verify API keys are valid

### Approval Gate Not Working
- Verify environment exists in GitHub settings
- Check required reviewers are added
- Ensure environment name matches workflow
- Verify reviewers have repository access

### Status Badges Don't Update
- Verify workflow files exist with correct names
- Check repository visibility settings
- Wait for badge cache to update
- Clear browser cache

### Security Scan Fails
- Check if due to actual vulnerabilities (expected)
- Verify scans use `continue-on-error: true`
- Review vulnerability reports in artifacts
- Update dependencies if needed

---

## 📝 Quick Reference

### Workflows Created
1. `backend-ci.yml` - Backend testing and linting
2. `frontend-ci.yml` - Frontend linting, build, E2E tests
3. `security-scan.yml` - Dependency vulnerability scanning
4. `deploy-backend-staging.yml` - Auto-deploy to Heroku staging
5. `deploy-frontend-staging.yml` - Auto-deploy to Netlify staging
6. `deploy-backend-production.yml` - Manual deploy to Heroku prod
7. `deploy-frontend-production.yml` - Manual deploy to Netlify prod

### Other Files
- `dependabot.yml` - Automated dependency updates
- `.github/workflows/README.md` - Comprehensive workflow docs
- `README.md` - Updated with status badges
- `requirements.txt` - Added ruff for linting
- `backend/pyproject.toml` - Ruff configuration

### Local Testing Commands

**Backend:**
```bash
cd backend
pytest --cov=. --cov-report=term-missing
ruff check .
ruff format --check .
```

**Frontend:**
```bash
cd frontend
npm run lint
npm run build
npm run preview
```

---

## 🎯 Success Criteria

The CI/CD pipeline is fully functional when:

1. ✅ All CI checks run automatically on pull requests
2. ✅ All tests and linting pass
3. ✅ Merges to main trigger automatic staging deployments
4. ✅ Staging environments are accessible and functional
5. ✅ Production deployments require manual approval
6. ✅ Production deployments succeed after approval
7. ✅ Status badges accurately reflect pipeline status
8. ✅ Security scanning runs and reports vulnerabilities
9. ✅ Dependabot is active and configured
10. ✅ All documentation is complete and accurate

---

## 📚 Related Documentation

- [Detailed CI/CD Workflow Documentation](./README.md)
- [Project README](../../README.md)

---

**Version:** 1.0
**Last Updated:** 2026-01-27
**Maintainer:** DevOps Team
