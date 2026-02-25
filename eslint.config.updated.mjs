import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
//import prettier from "eslint-config-prettier";

export default defineConfig([
  // Browser/extension environment + webextension-specific rules
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        browser: "readonly", // Firefox WebExtension API
      },
      ecmaVersion: 2022,
    },
  },

  // ✅ Mocha test globals
  {
    files: [
      "test/**/*.{js,mjs,cjs}",
      "tests/**/*.{js,mjs,cjs}",
      "**/*.test.{js,mjs,cjs}",
      "**/*.spec.{js,mjs,cjs}",
    ],
    languageOptions: {
      sourceType: "commonjs", // Tests use CommonJS (require/module.exports)
      globals: {
        ...globals.mocha,
        ...globals.node,
        // Mocha globals
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        // Chai globals (from setup.js)
        expect: "readonly",
        assert: "readonly",
        chai: "readonly",
        // Sinon globals (from setup.js)
        sinon: "readonly",
        // Browser API (from setup.js)
        browser: "readonly",
      },
    },
  },

  // targets CJS files specifically
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs" },
  },

  // Prevent ESLint rules from fighting Prettier
  //prettier,
]);
