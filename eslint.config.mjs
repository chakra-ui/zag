import eslint from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    ".next",
    "**/.svelte-kit",
    "**/.vercel",
    "build",
    "examples/next-ts",
    "examples/vue-ts",
    "plop-templates",
    "starters",
    "website",
    "**/*.d.ts",
    "**/.output",
  ]),
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // Suppress eslint:recommended rules that don't apply
      "no-case-declarations": "off",
      "no-empty": "off",
      "no-prototype-builtins": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      "no-unassigned-vars": "off",
      "no-useless-assignment": "off",
      "prefer-const": "off",
      "prefer-rest-params": "off",
      "prefer-spread": "off",
      "preserve-caught-error": "off",

      // Suppress typescript-eslint:recommended rules that don't apply
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",

      // Custom rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
])
