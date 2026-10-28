import { unstable_cache } from "next/cache"

export interface CommunityStats {
  npmTotalDownloads: number
  githubStars: number
  weeklyDownloads: number
  contributors: number
  asOf: string
}

export const getCommunityStats = unstable_cache(
  async (): Promise<CommunityStats | null> => {
    try {
      const registryRes = await fetch(
        "https://registry.npmjs.org/@zag-js/core",
        {
          headers: { "User-Agent": "zag-website-community-stats" },
          next: { revalidate: 60 * 60 * 6 },
        },
      )
      const registryJson = registryRes.ok ? await registryRes.json() : null
      const createdRaw = registryJson?.time?.created
      const createdAt =
        typeof createdRaw === "string" ? createdRaw.slice(0, 10) : null
      const today = new Date().toISOString().slice(0, 10)

      if (!createdAt) return null

      const npmRes = await fetch(
        `https://api.npmjs.org/downloads/range/${createdAt}:${today}/@zag-js/core`,
        {
          headers: { "User-Agent": "zag-website-community-stats" },
          next: { revalidate: 60 * 60 * 6 },
        },
      )
      const npmJson = npmRes.ok ? await npmRes.json() : null

      const npmStats =
        npmJson && Array.isArray(npmJson.downloads)
          ? {
              downloads: npmJson.downloads.reduce(
                (acc: number, item: { downloads?: number }) =>
                  acc +
                  (typeof item.downloads === "number" ? item.downloads : 0),
                0,
              ),
            }
          : null

      const ghRes = await fetch("https://api.github.com/repos/chakra-ui/zag", {
        headers: { "User-Agent": "zag-website-community-stats" },
        next: { revalidate: 60 * 60 * 6 },
      })
      const ghData = ghRes.ok ? await ghRes.json() : null

      const weekRes = await fetch(
        "https://api.npmjs.org/downloads/point/last-week/@zag-js/core",
        {
          headers: { "User-Agent": "zag-website-community-stats" },
          next: { revalidate: 60 * 60 * 6 },
        },
      )
      const weekJson = weekRes.ok ? await weekRes.json() : null

      // the contributors API pages one per page; the last page number is the count
      const contribRes = await fetch(
        "https://api.github.com/repos/chakra-ui/zag/contributors?per_page=1&anon=1",
        {
          headers: { "User-Agent": "zag-website-community-stats" },
          next: { revalidate: 60 * 60 * 6 },
        },
      )
      const lastPage = contribRes.headers
        .get("link")
        ?.match(/[?&]page=(\d+)>; rel="last"/)?.[1]

      if (
        !npmStats ||
        !ghData ||
        typeof ghData.stargazers_count !== "number" ||
        typeof weekJson?.downloads !== "number" ||
        !lastPage
      ) {
        return null
      }

      return {
        npmTotalDownloads: npmStats.downloads,
        githubStars: ghData.stargazers_count,
        weeklyDownloads: weekJson.downloads,
        contributors: Number(lastPage),
        asOf: new Date().toISOString().slice(0, 10),
      }
    } catch {
      return null
    }
  },
  ["community-stats"],
  { revalidate: 60 * 60 * 6 },
)
