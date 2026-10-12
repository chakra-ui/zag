import { components, guides, overviews, posts, utilities } from "./source"

export type SearchMetaItem = {
  content: string
  url: string
  type: "lvl1" | "lvl2" | "lvl3"
  hierarchy: {
    lvl1: string | null
    lvl2?: string | null
    lvl3?: string | null
  }
}

export type SearchMetaResult = SearchMetaItem[]

type TOC = {
  content: string
  slug: string
  lvl: number
}

function getSearchMeta() {
  const pages = [
    ...[...overviews, ...guides, ...components, ...utilities].map((doc) => ({
      title: doc.frontmatter.title,
      url: doc.frontmatter.slug,
      toc: doc.frontmatter.toc,
    })),
    ...posts.map((post) => ({
      title: post.title,
      url: `/blog/${post.slug}`,
      toc: post.toc,
    })),
  ]

  const result: SearchMetaResult = []

  for (const { title, url, toc } of pages) {
    result.push({
      content: title,
      type: "lvl1",
      url,
      hierarchy: { lvl1: title },
    })

    if (!Array.isArray(toc)) continue
    toc.forEach((item: TOC, index: number) => {
      result.push({
        content: item.content,
        type: `lvl${item.lvl}` as SearchMetaItem["type"],
        url: `${url}#${item.slug}`,
        hierarchy: {
          lvl1: title,
          lvl2:
            item.lvl === 2 ? item.content : (toc[index - 1]?.content ?? null),
          lvl3: item.lvl === 3 ? item.content : null,
        },
      })
    })
  }
  return result
}

export const searchData = getSearchMeta()
