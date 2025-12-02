# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the RestaurantPOS-System project.

## 📋 Available Workflows

### 1. **Backend CI** (`backend-ci.yml`)
**Triggers:** Push/PR to `main` or `develop` branches (when backend files change)

**What it does:**
- ✅ Build .NET API
- ✅ Run backend tests
- ✅ Code formatting check
- ✅ Security vulnerability scan
- ✅ Create publish artifacts

**When to use:** Automatically runs on backend changes

---

### 2. **Frontend CI** (`frontend-ci.yml`)
**Triggers:** Push/PR to `main` or `develop` branches (when frontend files change)

**What it does:**
- ✅ Install dependencies
- ✅ Run ESLint
- ✅ TypeScript type checking
- ✅ Run tests
- ✅ Build production bundle
- ✅ Lighthouse performance audit
- ✅ Security audit

**When to use:** Automatically runs on frontend changes

---

### 3. **Android CI** (`android-ci.yml`)
**Triggers:** Push/PR to `main` or `develop` branches (when Android files change)

**What it does:**
- ✅ Build Android app
- ✅ Run Android lint
- ✅ Run unit tests
- ✅ Build debug APK
- ✅ Build release APK (on main push)
- ✅ Build release AAB (on main push)

**When to use:** Automatically runs on Android changes

---

### 4. **Full CI/CD** (`full-ci.yml`)
**Triggers:** Push/PR to `main` branch, or manual trigger

**What it does:**
- ✅ Run all CI workflows (Backend, Frontend, Android)
- ✅ Integration tests
- ✅ Deploy to staging
- ✅ Deploy to production (manual approval)

**When to use:** 
- Automatically on main branch pushes
- Manually via GitHub Actions tab

---

### 5. **CodeQL Security Analysis** (`codeql-analysis.yml`)
**Triggers:** 
- Push to `main` or `develop`
- Every Monday at midnight
- Pull requests to `main`

**What it does:**
- ✅ Scan C# code for vulnerabilities
- ✅ Scan JavaScript/TypeScript code
- ✅ Scan Kotlin/Java code
- ✅ Report security issues

**When to use:** Automatically runs on schedule and code changes

---

### 6. **Dependency Review** (`dependency-review.yml`)
**Triggers:** Pull requests to `main` or `develop`

**What it does:**
- ✅ Review new dependencies
- ✅ Check for vulnerable packages
- ✅ Check license compatibility
- ✅ Backend dependency audit
- ✅ Frontend npm audit
- ✅ Android dependency check

**When to use:** Automatically runs on PRs

---

### 7. **Pull Request Validation** (`pr-validation.yml`)
**Triggers:** When PR is opened/updated

**What it does:**
- ✅ Validate PR title format
- ✅ Check PR size
- ✅ Check for merge conflicts
- ✅ Auto-label PR
- ✅ Add welcome comment

**When to use:** Automatically runs on all PRs

---

### 8. **Release Automation** (`release.yml`)
**Triggers:** 
- Push tags matching `v*.*.*`
- Manual workflow dispatch

**What it does:**
- ✅ Create GitHub release
- ✅ Generate changelog
- ✅ Build all components
- ✅ Upload release artifacts
- ✅ Send notifications

**When to use:** 
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

### 9. **Performance Testing** (`performance.yml`)
**Triggers:** 
- Every Sunday at 2 AM
- Manual trigger
- PRs affecting backend/frontend

**What it does:**
- ✅ Backend load testing (k6)
- ✅ Frontend Lighthouse audit
- ✅ Bundle size analysis
- ✅ Database benchmarks

**When to use:** 
- Automatically weekly
- Before major releases

---

### 10. **Stale Issues/PRs** (`stale.yml`)
**Triggers:** Daily at midnight

**What it does:**
- ✅ Mark inactive issues as stale (30 days)
- ✅ Mark inactive PRs as stale (14 days)
- ✅ Auto-close after 7 days
- ✅ Respect exempt labels

**When to use:** Automatically runs daily

---

## 🚀 How to Use

### Automatic Workflows
Most workflows run automatically when you:
- Push code to `main` or `develop`
- Create a pull request
- Push a tag

### Manual Workflows
Some workflows can be triggered manually:

1. Go to **Actions** tab on GitHub
2. Select the workflow you want to run
3. Click **Run workflow**
4. Select branch and inputs (if required)

### Creating a Release

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Or use GitHub UI:
# Releases → Draft a new release → Create tag
```

---

## 🔧 Configuration

### Required Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

#### Android Release
```
KEYSTORE_FILE          # Base64 encoded keystore file
KEYSTORE_PASSWORD      # Keystore password
KEY_PASSWORD          # Key password
KEY_ALIAS             # Key alias (e.g., restaurantpos)
```

**Generate KEYSTORE_FILE:**
```bash
base64 -w 0 restaurant-pos.keystore > keystore.txt
# Copy content of keystore.txt to GitHub secret
```

#### Optional Secrets
```
VITE_API_URL          # Production API URL for frontend builds
SLACK_WEBHOOK_URL     # For notifications (if implemented)
```

---

## 📊 Status Badges

Add these to your README.md:

```markdown
![Backend CI](https://github.com/HUYVESEA0/RestaurantPOS-System/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/HUYVESEA0/RestaurantPOS-System/workflows/Frontend%20CI/badge.svg)
![Android CI](https://github.com/HUYVESEA0/RestaurantPOS-System/workflows/Android%20CI/badge.svg)
![CodeQL](https://github.com/HUYVESEA0/RestaurantPOS-System/workflows/CodeQL/badge.svg)
```

---

## 🎯 Best Practices

### Commit Messages
Use conventional commits for better changelog generation:
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
perf: improve performance
test: add tests
build: update build config
ci: update CI config
chore: other changes
```

### PR Workflow
1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR
4. Wait for CI checks to pass
5. Request review
6. Merge when approved

### Release Workflow
1. Ensure all tests pass on `main`
2. Update version in relevant files
3. Create and push tag
4. Monitor release workflow
5. Download artifacts from GitHub Releases

---

## 🐛 Troubleshooting

### Workflow Failed
1. Check workflow logs in Actions tab
2. Look for red ❌ marks
3. Click on failed step to see details
4. Fix the issue and push again

### Secrets Not Working
1. Verify secret name matches exactly
2. Re-create secret if needed
3. Check if secret is available to workflow

### Build Artifacts Missing
1. Check if workflow completed successfully
2. Verify artifact upload step passed
3. Artifacts expire after retention period (7-30 days)

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

## 🤝 Contributing

When adding new workflows:
1. Test locally with [act](https://github.com/nektos/act) if possible
2. Add documentation to this README
3. Use descriptive job and step names
4. Add appropriate triggers
5. Handle errors gracefully

---

**Last Updated:** 2025-12-02  
**Project:** RestaurantPOS-System  
**Maintained by:** Development Team
