import {
  components,
  getSectionText,
  guides,
  overviews,
  posts,
  utilities,
} from "./source"

export type SearchMetaItem = {
  content: string
  url: string
  type: "lvl1" | "lvl2" | "lvl3"
  /** the opening text of the section, so a query can match what it says */
  text?: string
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

function excerpt(raw?: string) {
  if (!raw) return undefined
  const text = raw.replace(/[`*]/g, "").replace(/\s+/g, " ").trim()
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text
}

type Category = "overview" | "guides" | "components" | "utilities"

function getSearchMeta() {
  const pages = [
    ...[...overviews, ...guides, ...components, ...utilities].map((doc) => ({
      title: doc.frontmatter.title,
      url: doc.frontmatter.slug,
      toc: doc.frontmatter.toc,
      sections: getSectionText(doc.params[0] as Category, doc.slug),
    })),
    ...posts.map((post) => ({
      title: post.title,
      url: `/blog/${post.slug}`,
      toc: post.toc,
      sections: getSectionText("blog", post.slug),
    })),
  ]

  const result: SearchMetaResult = []

  for (const { title, url, toc, sections } of pages) {
    result.push({
      content: title,
      type: "lvl1",
      url,
      text: excerpt(sections.get("")),
      hierarchy: { lvl1: title },
    })

    if (!Array.isArray(toc)) continue
    toc.forEach((item: TOC, index: number) => {
      result.push({
        content: item.content,
        type: `lvl${item.lvl}` as SearchMetaItem["type"],
        url: `${url}#${item.slug}`,
        text: excerpt(sections.get(item.slug)),
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
