const { withPlausibleProxy } = require("next-plausible");

module.exports = withPlausibleProxy()({
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
});
