/* eslint-disable @typescript-eslint/no-require-imports */
const base = require("./eslint.base.config.cjs");
const overrides = require("./eslint.overrides.config.cjs");

//================================================

module.exports = [
  ...base,
  {
    plugins: {
      import: {},
    },
  },
  ...overrides,
];
