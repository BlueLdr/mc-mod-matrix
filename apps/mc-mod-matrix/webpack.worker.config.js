/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const webpack = require("webpack");
const { composePlugins, withNx } = require("@nx/webpack");

module.exports = composePlugins(withNx(), (config, { context, options }) => {
  config.mode = context.configurationName !== "production" ? "development" : "production";
  config.output.filename = options.options?.outputFileName;
  config.watch = options.options?.watch;
  config.module.rules = [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "tsconfig.worker.json"),
          },
        },
      ],
    },
  ];

  config.plugins.push(
    new webpack.EnvironmentPlugin({
      MCMM_CURSEFORGE_API_URL: process.env.MCMM_CURSEFORGE_API_URL || "https://api.curseforge.com",
      NEXT_PUBLIC_MCMM_MAX_SEARCH_RESULT_COUNT:
        process.env.NEXT_PUBLIC_MCMM_MAX_SEARCH_RESULT_COUNT || "10",
      NEXT_PUBLIC_MCMM_DATA_REGISTRY_CACHE_LIFESPAN:
        process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_CACHE_LIFESPAN || "86400000",
      NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_INTERVAL:
        process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_INTERVAL || "600000",
      NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_FETCH_INTERVAL:
        process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_FETCH_INTERVAL || "1000",
    }),
  );

  return config;
});
