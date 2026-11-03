import { createMDX } from "fumadocs-mdx/next"
import { mergedPageRedirects } from "./redirects.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
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
      source: "/guides/collection",
      destination: "/utilities/list-collection",
      permanent: true,
    },
    {
      source: "/overview/whats-a-machine",
      destination: "/guides/custom-machine-concepts",
      permanent: true,
    },
    // the build-your-own guides were split into sections
    ...[
      ["building-machines", "custom-machine-concepts"],
      ["framework-adapters", "framework-adapter-concepts"],
      ["design-system-with-panda", "design-system-overview"],
    ].map(([from, to]) => ({
      source: `/guides/${from}`,
      destination: `/guides/${to}`,
      permanent: true,
    })),
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
