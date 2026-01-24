module.exports = {
  typescript: { ignoreBuildErrors: true },
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    })
    return config
  },
}
