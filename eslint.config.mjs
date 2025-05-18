import base from "./eslint.base.config.mjs";
import overrides from "./eslint.overrides.config.mjs";

//================================================

export default [
  ...base,
  {
    plugins: {
      import: {},
    },
  },
  ...overrides,
];
