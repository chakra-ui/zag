import globals from "globals"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    name: "Zag Overrides",
    languageOptions: {
      globals: globals.node,
    },

    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },

    rules: {
      "no-case-declarations": "off",
      "no-empty": "off",
      "prefer-const": "off",
      "prefer-rest-params": "off",
      "prefer-spread": "off",
      "no-prototype-builtins": "off",

      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
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

  globalIgnores(
    [
      "**/dist/",
      "**/coverage/",
      "**/.svelte-kit/",
      "**/.next/",
      "**/.nuxt/",
      "**/styled-system",
      "**/build/",
      "examples/vue-ts",
      "**/*.d.ts",
    ],
    "Zag Ignores",
  ),
)
