//@ts-check

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import("@nx/next/plugins/with-nx").WithNxOptions}
 **/
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mui/*"],
  },
  // transpilePackages: ["@mui/material", "@mui/icons-material"],

  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  compiler: {
    // For other options, see https://nextjs.org/docs/architecture/nextjs-compiler#emotion
    emotion: true,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
