const { withPlausibleProxy } = require("next-plausible");
const withPWA = require("next-pwa");

module.exports = withPWA(
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
    },
  })
);
