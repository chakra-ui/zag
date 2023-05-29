import { allComponents, allOverviews } from "contentlayer/generated"

type SearchMetaItem = {
  content: string
  id: string
  url: string
  type: "lvl1" | "lvl2" | "lvl3"
  pathname: string
  slug: string[]
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
  lvl: 1 | 2 | 3
}

function getSearchMeta() {
  const documents = [...allOverviews, ...allComponents]

  const result: SearchMetaResult = []

  for (const doc of documents) {
    const { title, toc, slug } = doc.frontmatter
    const params = doc.params
    params.shift()

    result.push({
      content: title,
      id: doc._id,
      type: "lvl1",
      url: slug,
      pathname: doc.pathname,
      slug: params,
      hierarchy: {
        lvl1: title,
      },
    })

    toc.forEach((item: TOC, index: number) => {
      result.push({
        content: item.content,
        id: doc._id + item.slug,
        type: `lvl${item.lvl}` as any,
        url: slug + `#${item.slug}`,
        pathname: doc.pathname,
        slug: params,
        hierarchy: {
          lvl1: title,
          lvl2: item.lvl === 2 ? item.content : toc[index - 1]?.content ?? null,
          lvl3: item.lvl === 3 ? item.content : null,
        },
      })
    })
  }
  return result
}

export const searchData = getSearchMeta()
