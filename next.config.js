const { withPlausibleProxy } = require("next-plausible");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

module.exports = withBundleAnalyzer(
  withPWA(
    withPlausibleProxy()({
      reactStrictMode: true,
      images: {
        domains: ["media.giphy.com"],
      },
      async rewrites() {
        return [
          {
            source: "/",
            destination: "/speel/6",
          },
        ];
      },
      experimental: {
        // Enables the styled-components SWC transform
        styledComponents: true,
      },
      pwa: {
        dest: "public",
        register: false,
        skipWaiting: false,
        mode: "production",
        runtimeCaching,
        buildExcludes: [
          /middleware-manifest\.json$/,
          /_middleware.js$/,
          /_middleware.js.map$/,
        ],
      },
    })
  )
);
