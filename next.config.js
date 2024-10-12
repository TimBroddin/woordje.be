const { withPlausibleProxy } = require("next-plausible");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

module.exports = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    images: {
      domains: ["media.giphy.com"],
    },
    i18n: {
      locales: ["nl-NL", "nl-BE"],
      defaultLocale: "nl-BE",
      localeDetection: false,

      domains: [
        {
          domain: "www.woordje.be",
          defaultLocale: "nl-BE",
        },
        {
          domain: "www.woordol.nl",
          defaultLocale: "nl-NL",
        },
      ],
    },
    async rewrites() {
      return [
        {
          source: "/",
          destination: "/speel/6",
        },
      ];
    },
    swcMinify: true,

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
);
