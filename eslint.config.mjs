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
      globals: globals.browser,
      ecmaVersion: 2022,
    },
  },

  // ✅ Mocha test globals
  {
    files: [
      "test/**/*.{js,mjs,cjs}",
      "**/*.test.{js,mjs,cjs}",
      "**/*.spec.{js,mjs,cjs}",
    ],
    languageOptions: {
      globals: {
        ...globals.mocha,
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
