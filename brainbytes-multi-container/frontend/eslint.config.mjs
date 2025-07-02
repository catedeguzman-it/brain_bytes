import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js, react: pluginReact },
    languageOptions: {
      globals: {
        ...globals.browser,
        process: true, // ✅ fix "process is not defined"
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // ✅ fix outdated rule
      // optional: turn off strict prop types or other build-breaking rules
      "react/prop-types": "off",
      "no-undef": "off", // optional: to suppress 'global', 'jest', etc.
    },
    extends: ["plugin:react/recommended", "plugin:react/jsx-runtime"], // adds modern React rules
  },
]);
