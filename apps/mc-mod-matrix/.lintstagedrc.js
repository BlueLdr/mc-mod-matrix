const path = require("path");

const buildEslintCommand = filenames =>
  `next lint --file ${filenames.map(f => path.relative(process.cwd(), f)).join(" --file ")}`;

module.exports = {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
  "**/src/**/*.{js,jsx,ts,tsx,css,scss,md,graphql,json,yaml,yml}": ["prettier --write"],
};
