import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { fixupConfigRules } from "@eslint/compat";
import nx from "@nx/eslint-plugin";

import baseConfig from "../../eslint.base.config.mjs";
import { generateNestedOverridesConfig } from "../../eslint.overrides.config.mjs";

//================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const config = [
  ...fixupConfigRules(compat.extends("next")),

  ...fixupConfigRules(compat.extends("next/core-web-vitals")),

  ...nx.configs["flat/react-typescript"],
  ...baseConfig,
  {
    ignores: [".next/**/*"],
  },
  ...generateNestedOverridesConfig(),
];

export default config;
