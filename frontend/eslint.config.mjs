import globals from "globals";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import securityPlugin from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "jsx-a11y": jsxA11yPlugin,
      security: securityPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
      // You can add or override rules here
    },
  },
];