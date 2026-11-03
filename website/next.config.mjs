import { createMDX } from "fumadocs-mdx/next"
import { mergedPageRedirects } from "./redirects.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    externalDir: true,
    agentUpgrade: "security",
  },
  // /api/mdx and /api/md read page sources and package versions
  outputFileTracingIncludes: {
    "/api/mdx/[...slug]": [
      "./data/**/*.mdx",
      "./node_modules/@zag-js/*/package.json",
    ],
    "/api/md/[...slug]": [
      "./data/**/*.mdx",
      "./node_modules/@zag-js/*/package.json",
    ],
  },
  // Every docs page has a markdown twin, at `<page>.md` or with `Accept: text/markdown`
  rewrites: async () => ({
    beforeFiles: [
      {
        source: "/:section(overview|guides|utilities|components)/:path*.md",
        destination: "/api/md/:section/:path*",
      },
      {
        source: "/:section(overview|guides|utilities|components)/:path*",
        has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
        destination: "/api/md/:section/:path*",
      },
    ],
  }),
  redirects: async () => [
    ...mergedPageRedirects,
    {
      source: "/overview/whats-a-machine",
      destination: "/guides/building-machines",
      permanent: true,
    },
    {
      source: "/discord",
      destination: "https://discord.gg/ww6HE5xaZ2",
      permanent: true,
    },
    {
      source: "/guides/virtualizer",
      destination: "/utilities/virtualizer",
      permanent: true,
    },
  ],
}

const withMDX = createMDX()

export default withMDX(nextConfig)
