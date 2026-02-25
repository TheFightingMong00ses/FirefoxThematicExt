# Expanded CI/CD Pipeline Guide

## Overview

This CI/CD pipeline automates the following processes:

1. ✅ **Code Quality Checks** - ESLint, Prettier, and web-ext linting
2. ✅ **Automated Testing** - Run Mocha tests
3. ✅ **Build Extension** - Package the Firefox extension
4. ✅ **Security Audits** - Check for vulnerabilities
5. ✅ **Deployment** - Create releases (when ready)

---

## What This Pipeline Does

### **On Every Pull Request:**

```
1. Code Quality Check
   ├─ Run ESLint (code quality)
   ├─ Check Prettier formatting
   └─ Lint Firefox manifest

2. Run Tests
   └─ Execute Mocha test suite

3. Build Extension
   └─ Package extension as .zip

4. Security Audit
   ├─ npm audit (check vulnerabilities)
   └─ Check outdated dependencies
```

### **On Push to Main Branch:**

All of the above, PLUS:

```
5. Create Release (optional)
   ├─ Build extension
   ├─ Get version from manifest.json
   └─ Create GitHub release with .zip file
```

---

## Installation Instructions

### Step 1: Create GitHub Actions Directory

In your project root, create the workflow file:

```bash
# Create the directory structure
mkdir -p .github/workflows

# Create the workflow file
touch .github/workflows/ci.yml
```

### Step 2: Copy Workflow Configuration

Copy the contents of `ci-cd-expanded.yml` into `.github/workflows/ci.yml`

### Step 3: Ensure Required Scripts Exist

Your `package.json` already has most of these, but verify:

```json
{
  "scripts": {
    "test": "mocha", // ✅ Already have
    "lint": "eslint .", // ✅ Already have
    "lint:fix": "eslint . --fix", // ✅ Already have
    "format": "prettier . --write", // ✅ Already have
    "format:check": "prettier . --check", // ✅ Already have
    "ext:lint": "web-ext lint . --source-dir .", // ✅ Already have
    "ext:run": "web-ext run . --source-dir .", // ✅ Already have
    "check": "npm run lint && npm run format:check && npm run ext:lint" // ✅ Already have
  }
}
```

✅ **Good news:** You already have all required scripts!

### Step 4: Commit and Push

```bash
# Create a branch for this change
git checkout -b setup/ci-cd-pipeline

# Add the workflow file
git add .github/workflows/ci.yml

# Commit
git commit -m "Add comprehensive CI/CD pipeline"

# Push to GitHub
git push -u origin setup/ci-cd-pipeline
```

### Step 5: Create Pull Request

1. Go to GitHub
2. Create a Pull Request
3. **Watch the CI/CD pipeline run automatically!**
4. You'll see checks appear at the bottom of the PR

---

## Understanding Each Job

### Job 1: Code Quality Checks

**Purpose:** Ensure code meets quality standards before running tests.

**What it does:**

- ✅ Runs ESLint to catch code issues
- ✅ Checks Prettier formatting
- ✅ Validates Firefox extension manifest

**When it runs:** On every push and PR

**If it fails:**

- Check the ESLint errors: `npm run lint`
- Fix formatting: `npm run format`
- Check manifest: `npm run ext:lint`

---

### Job 2: Run Tests

**Purpose:** Verify code works correctly.

**What it does:**

- ✅ Runs Mocha test suite
- ⏸️ (Future) Generates coverage reports
- ⏸️ (Future) Uploads coverage to Codecov

**When it runs:** After code quality passes

**If it fails:**

- Run tests locally: `npm test`
- Check which test failed
- Fix the code or test

**To add coverage (future):**

```bash
# Install coverage tool
npm install --save-dev c8

# Add script to package.json
"test:coverage": "c8 mocha"

# Uncomment coverage steps in ci.yml
```

---

### Job 3: Build Extension

**Purpose:** Ensure extension can be packaged successfully.

**What it does:**

- ✅ Builds extension as .zip file
- ✅ Uploads artifact (downloadable for 30 days)
- ✅ Verifies manifest.json is valid

**When it runs:** After code quality and tests pass

**If it fails:**

- Check `web-ext` output
- Verify all required files exist
- Check manifest.json format

**To download built extension:**

1. Go to GitHub Actions tab
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download `firefox-extension.zip`

---

### Job 4: Security Audit

**Purpose:** Check for security vulnerabilities.

**What it does:**

- ✅ Runs `npm audit` to find vulnerable packages
- ✅ Checks for outdated dependencies
- ⚠️ Continues even if issues found (doesn't fail CI)

**When it runs:** On every push and PR (parallel with other jobs)

**If it shows vulnerabilities:**

```bash
# See details locally
npm audit

# Fix automatically (if possible)
npm audit fix

# For breaking changes
npm audit fix --force

# Update specific package
npm update package-name
```

---

### Job 5: Deploy/Release (Main Branch Only)

**Purpose:** Automatically create releases when code is merged to main.

**What it does:**

- ✅ Builds extension
- ✅ Gets version from manifest.json
- ⏸️ Creates GitHub release (currently commented out)

**When it runs:** Only when pushing to main branch

**To enable releases:**

1. Uncomment the "Create Release" step in `ci.yml`
2. Update version in `manifest.json`
3. Merge to main
4. CI will automatically create a release!

**Release workflow:**

```
1. Update version in manifest.json (e.g., 0.0.1 → 0.0.2)
2. Merge PR to main
3. CI runs and creates release "v0.0.2"
4. Extension .zip is attached to release
5. Users can download from Releases page
```

---

## CI/CD Status Badges

Add these to your README.md to show build status:

```markdown
![CI Status](https://github.com/TheFightingMong00ses/FirefoxThemeExt/workflows/Firefox%20Extension%20CI%2FCD/badge.svg)
```

Replace `TheFightingMong00ses/FirefoxThemeExt` with your actual repo path.

---

## Viewing CI/CD Results

### In Pull Requests

At the bottom of every PR, you'll see:

```
✅ Code Quality & Linting — Passed
✅ Run Tests — Passed
✅ Build Extension — Passed
✅ Security Audit — Passed
```

Click "Details" next to any check to see logs.

### In GitHub Actions Tab

1. Go to your repo
2. Click "Actions" tab
3. See all workflow runs
4. Click any run to see detailed logs

### In Commit History

Commits show ✅ (passed) or ❌ (failed) icons.

---

## What Gets Blocked

With this pipeline, you can configure branch protection to require:

**Go to Settings → Branches → Add Rule:**

1. Branch name pattern: `main`
2. Check: "Require status checks to pass before merging"
3. Select these checks:
   - ✅ Code Quality & Linting
   - ✅ Run Tests
   - ✅ Build Extension

Now PRs can't be merged if:

- ESLint finds issues
- Prettier formatting is wrong
- Tests fail
- Extension doesn't build

---

## Adding More Checks (Future)

### Test Coverage Requirement

```yaml
# In ci.yml, uncomment:
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
```

Then add to package.json:

```json
"test:coverage": "c8 mocha"
```

### Cross-Platform Testing

```yaml
# Uncomment the cross-platform-test job in ci.yml
# Tests on Windows, macOS, and Linux
```

### Automated Versioning

Add to package.json:

```json
"version:patch": "npm version patch",
"version:minor": "npm version minor",
"version:major": "npm version major"
```

Then:

```bash
npm run version:patch  # 0.0.1 → 0.0.2
git push --follow-tags
```

---

## Troubleshooting

### "npm ci" Fails

**Cause:** package-lock.json out of sync

**Fix:**

```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
```

### ESLint Fails in CI but Passes Locally

**Cause:** Different ESLint versions or config

**Fix:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run checks locally
npm run check
```

### Build Step Fails

**Cause:** Missing files or wrong manifest

**Fix:**

```bash
# Test build locally
npx web-ext build --source-dir=. --artifacts-dir=dist

# Check for errors
```

### CI is Slow

**Causes:**

- Installing dependencies every time
- Running unnecessary steps

**Fixes:**

- ✅ Already using `cache: 'npm'` for faster installs
- ✅ Jobs run in parallel where possible
- Consider: Skip some jobs on draft PRs

---

## Current vs Future State

### ✅ Currently Active

- [x] ESLint checking
- [x] Prettier formatting check
- [x] Firefox manifest validation
- [x] Mocha tests
- [x] Extension building
- [x] Security audits
- [x] Artifact uploads

### ⏸️ Ready to Enable (Commented Out)

- [ ] Test coverage reporting
- [ ] Codecov integration
- [ ] Automatic releases
- [ ] Cross-platform testing

### 🔮 Future Enhancements

- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] Automated Firefox submission
- [ ] Changelog generation
- [ ] Semantic versioning

---

## Team Workflow with CI/CD

### Developer Workflow

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Check locally (optional but recommended)
npm run check

# 4. Commit and push
git add .
git commit -m "Add feature"
git push origin feature/my-feature

# 5. Create PR on GitHub
# → CI runs automatically
# → Wait for checks to pass
# → Request review
# → Merge when approved
```

### What Happens Automatically

1. **On PR Creation:**
   - All quality checks run
   - Tests execute
   - Extension builds
   - Security audit runs

2. **On PR Update:**
   - CI re-runs automatically
   - New commits trigger new checks

3. **On Merge to Main:**
   - All checks run again
   - Extension builds
   - (Future) Release created

---

## Cost & Limits

### GitHub Actions Free Tier

**For Public Repos:**

- ✅ Unlimited minutes
- ✅ Unlimited storage
- ✅ Free forever

**For Private Repos:**

- 2,000 minutes/month free
- 500 MB storage free
- Your project uses ~5 minutes per run
- = ~400 PR checks per month free

**Current Usage:**
Each workflow run takes approximately:

- Code Quality: 1 minute
- Tests: 1 minute
- Build: 2 minutes
- Security: 30 seconds
- **Total: ~5 minutes per PR**

---

## Best Practices

### 1. Always Check Locally First

```bash
# Before pushing, run:
npm run check
```

This catches issues before CI, saving time.

### 2. Fix CI Failures Immediately

Don't merge PRs with failing checks, even if you think the failure is "minor."

### 3. Keep CI Fast

- Don't add unnecessary steps
- Use caching (already enabled)
- Run jobs in parallel (already done)

### 4. Review CI Logs

When CI fails, click "Details" and read the logs. They usually tell you exactly what's wrong.

### 5. Update Dependencies Regularly

```bash
# Check for outdated packages
npm outdated

# Update non-breaking changes
npm update

# Update breaking changes carefully
npm install package-name@latest
```

---

## Quick Reference

### Common Commands

```bash
# Check everything locally
npm run check

# Fix formatting
npm run format

# Fix linting
npm run lint:fix

# Run tests
npm test

# Build extension
npx web-ext build --source-dir=.
```

### GitHub Actions Locations

- Workflow file: `.github/workflows/ci.yml`
- View runs: GitHub → Actions tab
- View on PR: Scroll to bottom of PR
- Download artifacts: Actions → Run → Artifacts section

### Fixing Failed Checks

| Failed Check | How to Fix            |
| ------------ | --------------------- |
| ESLint       | `npm run lint:fix`    |
| Prettier     | `npm run format`      |
| Tests        | `npm test` → Fix code |
| Build        | Check manifest.json   |
| Security     | `npm audit fix`       |

---

## Next Steps

1. ✅ **Add workflow file** - Copy `ci-cd-expanded.yml` to `.github/workflows/ci.yml`
2. ✅ **Test it** - Create a PR and watch it run
3. ✅ **Enable branch protection** - Require checks to pass
4. ⏸️ **Add test coverage** - When you have more tests
5. ⏸️ **Enable releases** - When ready for v0.1.0

---

**Questions?** Check the GitHub Actions documentation or ask the team!

**Last Updated:** February 2026  
**Maintained By:** The Fighting Mong00ses
