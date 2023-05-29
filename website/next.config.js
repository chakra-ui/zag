const { withContentlayer } = require("next-contentlayer")

/**
 * @type {import('next').NextConfig}
 */
module.exports = withContentlayer({
  swcMinify: false,
  experimental: { esmExternals: true, externalDir: true },
  redirects: () => [
    {
      source: "/discord",
      destination: "https://discord.gg/ww6HE5xaZ2",
      permanent: true,
    },
  ],
})
