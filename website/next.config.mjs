import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // next writes AGENTS.md / CLAUDE.md into the project on every dev start
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
  },
  // /api/mdx reads page sources and package versions at request time
  outputFileTracingIncludes: {
    "/api/mdx/[...slug]": [
      "./data/**/*.mdx",
      "./node_modules/@zag-js/*/package.json",
    ],
  },
  redirects: async () => [
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
