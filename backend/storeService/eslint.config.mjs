import globals from "globals";
import js from "@eslint/js";
import securityPlugin from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      security: securityPlugin,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
    rules: {
      ...securityPlugin.configs.recommended.rules,
      // Node.js specific rules
      "no-console": "off", // Allow console.log etc. in Node.js
      "no-process-exit": "error", // Disallow process.exit()
      "node/no-unsupported-features/es-syntax": "off", // Allow modern ES syntax
      "node/no-missing-import": "off", // ESM doesn't require file extensions
      // You can add or override rules here
    },
    settings: {
      node: {
        version: "detect", // Automatically detect Node.js version
      },
    },
  },
];