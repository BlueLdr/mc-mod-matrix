import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";

//================================================

const internalImportsOrder = [
  "@(~/api)",
  "@(~/app)",
  "@(~/data)",
  "@(~/context)",
  "@(~/routing)",
  "@(~/theme)",
  "@(~/utils)",
  "@(~/components)",
  "~/components/*",
  "@(~/assets)",
];

const libImportsOrder = ["@mcmm/**"];

const muiExternalImportsOrder = [
  "@mui/base/**",
  "@mui/material/styles",
  "@mui/material/useMediaQuery",
  "@mui/system/**",
  "@mui/utils",
];

const muiComponentImportsOrder = ["@mui/material/**", "@mui/icons-material/*"];

export const importConfig = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended"],
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      rules: {
        "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
        "import/no-anonymous-default-export": "off",
        "import/no-unresolved": "error",
        "import/no-duplicates": "error",
        "import/no-internal-modules": [
          "error",
          {
            forbid: [
              "@mui/*/*/**",
              "@mui/material",
              "@mui/icons-material",
              "~/components/**/*",
              "~/components/!(routes)",
              "~/utils/**",
              "~/theme/**",
              "~/app/**",
              "~/api/**",
              "~/context/**",
              "~/routing/**",
              "~/assets/**",
              "~/data/**",
              "./*/**",
              "../*/**",
              "../../*/**",
              "../../../*/**",
              "../../../../*/**",
            ],
          },
        ],
        "import/order": [
          "error",
          {
            "newlines-between": "always",
            groups: [
              ["builtin", "external"],
              ["internal"],
              ["parent", "sibling", "index", "object"],
              ["unknown"],
              "type",
            ],
            pathGroups: [
              ...muiExternalImportsOrder.map(pattern => ({
                pattern,
                group: "external",
              })),
              ...libImportsOrder.map(pattern => ({
                pattern,
                group: "internal",
              })),
              ...internalImportsOrder.map(pattern => ({
                pattern,
                group: "parent",
              })),
              ...muiComponentImportsOrder.map(pattern => ({
                pattern,
                group: "unknown",
              })),
            ],
            distinctGroup: false,
            pathGroupsExcludedImportTypes: ["type"],
          },
        ],
      },
    },
  ],
  ignorePatterns: ["dist/**/*", "**/*.html", "**/*.min.js", "**/.next/**/*"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        project: ["tsconfig.json"],
      },
    },
    "import/internal-regex":
      "^~/((api)|(app)|(assets)|(data)|(theme)|(context)|(routing)|(components)|(utils))",
  },
};

export const tseslintConfig = {
  files: [
    "**/*.ts",
    "**/*.tsx",
    "**/*.cts",
    "**/*.mts",
    "**/*.js",
    "**/*.jsx",
    "**/*.cjs",
    "**/*.mjs",
  ],
  // Override or add rules here
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/consistent-type-imports": "error",
  },
};

//================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const overridesCompat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: tseslint.configs.recommended,
});

export const generateNestedOverridesConfig = () => [
  ...overridesCompat.config({
    ...importConfig,
    plugins: ["import"],
  }),
  tseslintConfig,
];

export default [...overridesCompat.config(importConfig), tseslintConfig];
