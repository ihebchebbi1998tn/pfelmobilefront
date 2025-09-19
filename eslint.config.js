import globals from "globals";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import babelParser from "@babel/eslint-parser";

/** @type {import("@eslint/eslintrc").Linter.Config} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
      parser: babelParser,
    },
    plugins: {
      react,
      prettier,
    },
    settings: {
      react: {
        version: "detect", 
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
    },
  },
];
