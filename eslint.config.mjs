import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        node: true,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["dist", "node_modules", "coverage", ".next", "build", "examples/vue-ts", "plop-templates"],

    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-param-reassign": "off",
      "prefer-spread": "off",
      "no-console": "off",
      "prefer-const": "off",
      "jsx-a11y/no-autofocus": "off",
      "import/named": "off",
      "import/prefer-default-export": "off",
      "no-underscore-dangle": "off",
      "no-shadow": "off",
      "no-plusplus": "off",
      "spaced-comment": "off",
      "guard-for-in": "off",
      "operator-assignment": "off",
      "prefer-destructuring": "off",
      "consistent-return": "off",
      "no-restricted-syntax": "off",
      "no-continue": "off",
      eqeqeq: "off",
      "@typescript-eslint/dot-notation": "off",
      "no-bitwise": "off",
      "no-redeclare": "off",
      "@typescript-eslint/naming-convention": "off",
      "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "no-alert": "off",
      "@typescript-eslint/no-shadow": "off",
      "import/no-named-as-default": "off",
      "prefer-object-spread": "off",
      "arrow-body-style": "off",
      "import/namespace": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "default-case": "off",
    },
  },

  {
    files: ["*.js", "*.jsx"],
    parserOptions: {
      project: "tsconfig.eslint.json",
    },
  },
]
