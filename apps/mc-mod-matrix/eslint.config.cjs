/* eslint-disable @typescript-eslint/no-require-imports */

const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const { fixupConfigRules } = require("@eslint/compat");
const nx = require("@nx/eslint-plugin");

const baseConfig = require("../../eslint.base.config.cjs");
const overrides = require("../../eslint.overrides.config.cjs");

//================================================

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...fixupConfigRules(compat.extends("next")),

  ...fixupConfigRules(compat.extends("next/core-web-vitals")),

  ...nx.configs["flat/react-typescript"],
  ...baseConfig,
  {
    ignores: [".next/**/*"],
  },
  ...overrides,
];
