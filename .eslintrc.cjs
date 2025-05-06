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

const muiExternalImportsOrder = [
  "@mui/base/**",
  "@mui/material/styles",
  "@mui/material/useMediaQuery",
  "@mui/system/**",
  "@mui/utils",
];

const muiComponentImportsOrder = ["@mui/material/**", "@mui/icons-material/*"];

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended"],
  plugins: ["react-hooks", "react-refresh", "import"],
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      rules: {
        "react-refresh/only-export-components": [
          "warn",
          { allowConstantExport: true },
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/consistent-type-imports": "error",
        // "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
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
          "warn",
          {
            "newlines-between": "always",
            groups: [
              ["builtin", "external"],
              ["internal", "parent", "sibling", "index", "object"],
              "unknown",
              "type",
            ],
            pathGroups: [
              ...muiExternalImportsOrder.map(pattern => ({
                pattern,
                group: "external",
              })),
              ...internalImportsOrder.map(pattern => ({
                pattern,
                group: "internal",
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
  ignorePatterns: [
    "dist/**/*",
    "src/api/__generated__/*",
    "**/*.html",
    "**/*.min.js",
    "**/vite.config.ts",
  ],
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
