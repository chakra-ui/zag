/** @type {import('next').NextConfig} */
const nextConfig = {
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
  ],
}

export default async function config() {
  if (process.env.VELITE_STARTED) {
    return nextConfig
  }

  process.env.VELITE_STARTED = '1'
  const { build } = await import('velite')

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    console.log('Starting Velite in watch mode...')
    build({ watch: true })
  } else {
    await build({ clean: true })
  }

  return nextConfig
}
