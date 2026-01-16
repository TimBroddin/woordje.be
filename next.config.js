module.exports = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.giphy.com",
      },
    ],
  },
};
