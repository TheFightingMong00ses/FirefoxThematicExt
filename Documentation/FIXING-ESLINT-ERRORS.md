# Fixing ESLint Errors in Test Files

## What Happened

When you ran `npm run check`, ESLint found 51 errors in your test files. These aren't bugs in your code - they're configuration issues where ESLint doesn't understand the test environment.

## The Errors Explained

### 1. **"'browser' is not defined"**

```javascript
browser.runtime.onMessage.addListener.reset();
// ESLint error: 'browser' is not defined
```

**Why:** ESLint doesn't know that `browser` is a global variable set up in `tests/setup.js`

**Fix:** Tell ESLint that `browser` is a global in test files

---

### 2. **"'expect' is not defined"**

```javascript
expect(result).to.equal(5);
// ESLint error: 'expect' is not defined
```

**Why:** ESLint doesn't know that Chai's `expect` is globally available

**Fix:** Add `expect`, `assert`, and `chai` to ESLint globals for test files

---

### 3. **"'sinon' is not defined"**

```javascript
const spy = sinon.stub();
// ESLint error: 'sinon' is not defined
```

**Why:** ESLint doesn't know that `sinon` is globally available from setup

**Fix:** Add `sinon` to ESLint globals for test files

---

### 4. **"'require' is not defined"**

```javascript
const chai = require("chai");
// ESLint error: 'require' is not defined
```

**Why:** Your test files use CommonJS (`require`), but ESLint is configured for ES modules

**Fix:** Set `sourceType: "commonjs"` for test files

---

### 5. **"'afterEach' is not defined"**

```javascript
afterEach(() => {
  sinon.reset();
});
// ESLint error: 'afterEach' is not defined
```

**Why:** ESLint doesn't know about Mocha globals (`describe`, `it`, `beforeEach`, etc.)

**Fix:** Add Mocha globals to ESLint config for test files

---

### 6. **Unused Variables**

```javascript
const messageHandler = () => {};
// ESLint error: 'messageHandler' is defined but never used
```

**Why:** Variables declared but not used (legitimate error)

**Fix:** Remove unused variables from test file

---

## How to Fix It

### Step 1: Update ESLint Config

Replace your `eslint.config.mjs` with the updated version:

**Key changes:**

```javascript
{
  files: ["tests/**/*.{js,mjs,cjs}", "**/*.test.{js,mjs,cjs}"],
  languageOptions: {
    sourceType: "commonjs",  // ← Added this
    globals: {
      ...globals.mocha,
      ...globals.node,       // ← Added for 'require', 'global'
      // Test framework globals
      describe: "readonly",
      it: "readonly",
      beforeEach: "readonly",
      afterEach: "readonly",
      // Chai globals
      expect: "readonly",     // ← Added
      assert: "readonly",     // ← Added
      chai: "readonly",       // ← Added
      // Sinon globals
      sinon: "readonly",      // ← Added
      // Browser API
      browser: "readonly",    // ← Added
    },
  },
}
```

### Step 2: Replace Test Files

Replace the test files with the cleaned versions:

1. **`tests/setup.js`** → Use `setup-fixed.js`
2. **`tests/mongoose.test.js`** → Use `mongoose-test-fixed.js`

These files:

- ✅ Have no unused variables
- ✅ Use proper CommonJS syntax
- ✅ Test actual functionality (not commented-out code)
- ✅ Will pass ESLint

---

## Quick Fix Instructions

```bash
# 1. Backup your current config
cp eslint.config.mjs eslint.config.mjs.backup

# 2. Replace with updated config
# Copy eslint.config.updated.mjs → eslint.config.mjs

# 3. Replace test setup
# Copy setup-fixed.js → tests/setup.js

# 4. Replace test file
# Copy mongoose-test-fixed.js → tests/mongoose.test.js

# 5. Run check again
npm run check
```

---

## What the Fixed Config Does

### Before:

```javascript
{
  files: ["test/**/*.{js,mjs,cjs}", "**/*.test.{js,mjs,cjs}"],
  languageOptions: {
    globals: {
      ...globals.mocha,  // Only Mocha globals
    },
  },
}
```

### After:

```javascript
{
  files: ["tests/**/*.{js,mjs,cjs}", "**/*.test.{js,mjs,cjs}"],
  languageOptions: {
    sourceType: "commonjs",  // Support require/module.exports
    globals: {
      ...globals.mocha,      // Mocha: describe, it, etc.
      ...globals.node,       // Node: require, global, etc.
      expect: "readonly",    // Chai assertion
      assert: "readonly",    // Chai assertion
      chai: "readonly",      // Chai library
      sinon: "readonly",     // Sinon mocking
      browser: "readonly",   // Browser API mock
    },
  },
}
```

---

## Understanding the File Structure

```javascript
// tests/setup.js
// Runs BEFORE all tests (configured in .mocharc.json)
const chai = require("chai");
global.expect = chai.expect; // Makes 'expect' available everywhere
global.sinon = require("sinon"); // Makes 'sinon' available everywhere
global.browser = mockBrowser; // Makes 'browser' mock available everywhere

// tests/mongoose.test.js
// Can now use expect, sinon, browser without importing!
describe("Test", () => {
  it("works", () => {
    expect(browser).to.exist; // ✅ All globals available
  });
});
```

---

## Verifying the Fix

After replacing the files:

```bash
# Should pass with 0 errors
npm run lint

# Should pass formatting check
npm run format:check

# Should validate manifest
npm run ext:lint

# Should run all checks
npm run check

# Should run tests
npm test
```

---

## Why This Happened

1. **ESLint is strict by default** - Assumes nothing is global
2. **Test files need special config** - Different globals than production code
3. **CommonJS vs ES Modules** - Tests use `require`, source code uses `import`
4. **Setup file creates globals** - ESLint doesn't automatically know this

This is normal! Most projects need special ESLint config for test files.

---

## Common ESLint Patterns for Tests

### For Mocha + Chai + Sinon (what you have):

```javascript
{
  files: ["tests/**/*.js"],
  languageOptions: {
    sourceType: "commonjs",
    globals: {
      ...globals.mocha,
      ...globals.node,
      expect: "readonly",
      sinon: "readonly",
      browser: "readonly",
    },
  },
}
```

### For Jest (if you were using it):

```javascript
{
  files: ["tests/**/*.js"],
  languageOptions: {
    globals: {
      ...globals.jest,
      jest: "readonly",
      expect: "readonly",
    },
  },
}
```

---

## Future: When Adding New Globals

If you add new global variables to `tests/setup.js`:

```javascript
// tests/setup.js
global.myNewHelper = () => {
  /* ... */
};
```

Update ESLint config:

```javascript
{
  files: ["tests/**/*.js"],
  languageOptions: {
    globals: {
      // ... existing globals ...
      myNewHelper: "readonly",  // ← Add this
    },
  },
}
```

---

## Summary

| Error Type              | Cause                 | Fix                   |
| ----------------------- | --------------------- | --------------------- |
| `browser not defined`   | Missing global        | Add to ESLint globals |
| `expect not defined`    | Missing global        | Add to ESLint globals |
| `sinon not defined`     | Missing global        | Add to ESLint globals |
| `require not defined`   | Wrong sourceType      | Set to "commonjs"     |
| `afterEach not defined` | Missing Mocha globals | Add globals.mocha     |
| Unused variables        | Actual code issue     | Remove unused code    |

**After the fix:** 51 errors → 0 errors ✅

---

## Next Steps

1. ✅ Replace ESLint config
2. ✅ Replace test files
3. ✅ Run `npm run check` - should pass!
4. ✅ Continue with CI/CD setup
5. ✅ Write more tests as needed

---

**Questions?** These ESLint errors are configuration issues, not code bugs. Once the config is updated, everything will work!
