# Git Workflow Guide for Firefox Theme Extension Team

## Core Principles

1. **`main` branch is sacred** - Always working, always deployable
2. **Always work on feature branches** - Never commit directly to `main`
3. **Pull before you push** - Always sync with remote before starting work
4. **Small, focused PRs** - Easier to review and merge quickly

---

## Daily Workflow

### Before Starting ANY New Work

```bash
# 1. Switch to main
git checkout main

# 2. Get the absolute latest from GitHub
git pull origin main

# 3. Create a NEW branch for your specific task
git checkout -b your-feature-name
```

### While Working on Your Branch

```bash
# Make your changes in your code editor, then:

# Stage your changes
git add .

# Commit with a clear message
git commit -m "Clear description of what you did"

# BEFORE pushing, sync with main again (in case others merged)
git checkout main
git pull origin main
git checkout your-feature-name
git merge main

# Resolve any conflicts NOW (before pushing)

# Then push your branch
git push origin your-feature-name
```

### Creating and Merging a Pull Request

1. Push your branch to GitHub
2. Go to GitHub and create a Pull Request
3. **Assign at least one teammate as a reviewer**
4. Wait for approval (or address feedback)
5. **Merge using "Squash and merge"** on GitHub
6. **Click "Delete branch"** immediately after merging
7. Clean up locally:
   ```bash
   git checkout main
   git pull origin main
   git branch -d your-feature-name
   ```

---

## Branch Naming Convention

Use descriptive names that explain what the branch does:

- `feature/add-theme-toggle` - New features
- `fix/broken-icon-loading` - Bug fixes
- `setup/eslint-config` - Setup/configuration
- `docs/update-readme` - Documentation updates

---

## Pull Request Best Practices

### Good PR ✅

- One feature or fix per PR
- Clear title and description
- Small (< 300 lines changed if possible)
- All tests/linting passing (CI checks green)
- Reviewed by at least one teammate

### Bad PR ❌

- Multiple unrelated changes
- No description
- Thousands of lines changed
- Conflicts with main
- No review

---

## Handling Merge Conflicts

If you get a conflict during `git merge main`:

### Option 1: Fix Conflicts Manually

```bash
# Git will mark the conflicting files
# Edit the files to resolve conflicts (look for <<<<<<< markers)
git add .
git commit -m "Resolve merge conflicts"
```

### Option 2: For package-lock.json Specifically

```bash
# Delete and regenerate
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
```

**Why this works:** The `package-lock.json` file is automatically generated from your `package.json`. As long as your `package.json` is correct and up-to-date, you can safely delete and regenerate `package-lock.json` at any time using `npm install`. The regenerated file will have the exact same dependencies - it's just resolving the conflict by creating a fresh, conflict-free version. This is actually the recommended approach for `package-lock.json` conflicts because:

- It's faster than manually resolving conflicts
- It eliminates the risk of syntax errors in the lock file
- npm knows better than we do how to structure it correctly
- The lock file is a build artifact, not source code

---

## Team Communication Rules

1. **Announce when you're working on something** - "I'm adding the theme switcher UI"
2. **Merge PRs quickly** - Don't let them sit for days
3. **Pull `main` at the start of each work session**
4. **Never force push** (`git push -f`) to shared branches
5. **Ask for help if stuck** - Better to ask than to mess up `main`

---

## Commands You'll Use Daily

### Checking Status

```bash
# See what branch you're on and what's changed
git status

# See all branches
git branch

# See commit history
git log --oneline
```

### Switching Branches

```bash
# Switch to an existing branch
git checkout branch-name

# Create and switch to a new branch
git checkout -b new-branch-name
```

### Syncing with Remote

```bash
# Get latest changes from GitHub
git pull origin main

# Push your changes to GitHub
git push origin your-branch-name
```

### Cleaning Up Branches

```bash
# Delete a local branch (after it's merged)
git branch -d branch-name

# Delete a remote branch on GitHub
git push origin --delete branch-name

# Clean up tracking of deleted remote branches
git fetch --prune
```

---

## Quick Reference Card

```
START OF DAY:
  git checkout main
  git pull origin main
  git checkout -b feature/my-task

DURING WORK:
  <make changes>
  git add .
  git commit -m "Description"

BEFORE PUSHING:
  git checkout main
  git pull origin main
  git checkout feature/my-task
  git merge main
  <resolve conflicts if any>
  git push origin feature/my-task

ON GITHUB:
  Create PR → Get review → Merge → Delete branch

CLEAN UP:
  git checkout main
  git pull origin main
  git branch -d feature/my-task
```

---

## What to NEVER Do

❌ **NEVER** commit directly to `main`  
❌ **NEVER** use `git push -f` (force push) on shared branches  
❌ **NEVER** leave PRs open for days without merging or closing  
❌ **NEVER** merge without someone else reviewing  
❌ **NEVER** push without pulling first

---

## Understanding package-lock.json

### What is it?

`package-lock.json` is an **automatically generated file** that npm creates based on your `package.json`. It locks down the exact versions of all dependencies and sub-dependencies used in your project.

### Key Points

- **Source of truth:** Your `package.json` is the source of truth, not `package-lock.json`
- **Can be regenerated:** You can safely delete and regenerate it anytime with `npm install`
- **Should be committed:** Always commit it to Git so the whole team uses the same versions
- **Conflict resolution:** When in doubt during a merge conflict, delete it and run `npm install`

### Why Deleting and Regenerating is Safe

1. `package-lock.json` is derived from `package.json`
2. As long as your `package.json` is correct, npm will recreate the exact same lock file
3. It's a **build artifact**, not source code you wrote
4. npm is better at generating this file than we are at manually editing it

### The Rule

**If `package-lock.json` has conflicts:** Delete it, run `npm install`, commit the regenerated version.  
**If `package.json` has conflicts:** Fix those manually first, THEN regenerate `package-lock.json`.

---

## Understanding Git Stash

### What is git stash?

`git stash` is like a temporary clipboard for your uncommitted changes. It saves your work-in-progress so you can switch branches or pull updates without losing your changes.

### How it works

```bash
# Save your current changes temporarily
git stash

# Do other work (switch branches, pull updates, etc.)
git checkout other-branch

# Come back and restore your saved changes
git checkout original-branch
git stash pop
```

### How long are stashed changes saved?

**Stashed changes are saved indefinitely** - they don't expire or get deleted automatically. They stay in your local repository until you:

- Apply them with `git stash pop` or `git stash apply`
- Manually delete them with `git stash drop`
- Delete the entire repository

### Important Notes

- Stashes are **local only** - they don't go to GitHub
- You can have multiple stashes stacked up
- Each stash is numbered (stash@{0}, stash@{1}, etc.)
- They survive across terminal sessions and reboots

### Useful Stash Commands

```bash
# Save changes with a descriptive message
git stash save "Work on theme toggle feature"

# List all your stashes
git stash list

# Apply the most recent stash and keep it in the stash list
git stash apply

# Apply the most recent stash and remove it from the list
git stash pop

# Apply a specific stash
git stash apply stash@{1}

# Delete a specific stash
git stash drop stash@{0}

# Delete all stashes
git stash clear

# See what's in a stash without applying it
git stash show -p
```

### When to use git stash

✅ **Good times to stash:**

- You need to switch branches but have uncommitted changes
- You need to pull updates but have local changes
- You want to try something experimental without committing
- You're in the middle of work but need to fix an urgent bug

❌ **When NOT to stash:**

- For long-term storage (use commits and branches instead)
- For sharing work with teammates (use commits and push instead)
- If you're done with the work (just commit it)

### Common Workflow Example

```bash
# You're working on a feature
git checkout feature/my-work
# ...making changes...

# Teammate asks you to review their urgent PR
git stash save "Half-done theme toggle UI"

# Switch to review their work
git checkout their-branch
# ...review code...

# Switch back and restore your work
git checkout feature/my-work
git stash pop

# Continue where you left off
```

---

## Troubleshooting Common Issues

### "I have uncommitted changes but need to switch branches"

```bash
# Save your work temporarily
git stash

# Switch branches
git checkout other-branch

# Come back and restore your work
git checkout original-branch
git stash pop
```

### "I accidentally committed to main"

```bash
# Create a branch with your changes
git branch feature/my-accidental-work

# Reset main to match remote
git reset --hard origin/main

# Switch to your new branch
git checkout feature/my-accidental-work
```

### "My branch is way behind main"

```bash
# Make sure you're on your branch
git checkout your-branch

# Merge latest main
git checkout main
git pull origin main
git checkout your-branch
git merge main

# Resolve conflicts, then push
git push origin your-branch
```

### "I need to undo my last commit"

```bash
# Undo the commit but keep the changes
git reset --soft HEAD~1

# Undo the commit and discard the changes
git reset --hard HEAD~1
```

---

## GitHub Branch Protection Setup

**Team Lead should set this up:**

1. Go to repo Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable these protections:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass (CI/CD must be green)
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

This prevents ANYONE (including admins) from pushing directly to `main`.

---

## Getting Help

If you're stuck or unsure:

1. Run `git status` to see what state you're in
2. Ask the team in our group chat
3. Check this guide
4. Google the exact error message

**Remember:** It's better to ask than to accidentally mess up the repo!

---

## Resources

- [Official Git Documentation](https://git-scm.com/doc)
- [GitHub PR Guide](https://docs.github.com/en/pull-requests)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Last Updated:** February 6, 2026  
**Maintained By:** Development Team
