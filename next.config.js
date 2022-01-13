const { withPlausibleProxy } = require("next-plausible");

module.exports = withPlausibleProxy()({
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/speel/6",
      },
    ];
  },
});
