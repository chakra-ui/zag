import { components as allComponents, overviews as allOverviews } from ".velite"

export type SearchMetaItem = {
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
  title: string
  url: string
  items: TOC[]
}

function getSearchMeta() {
  const documents = [...allOverviews, ...allComponents]

  const result: SearchMetaResult = []

  for (const doc of documents) {
    const { title, toc, slug } = doc.frontmatter
    const params = [...doc.params]
    params.shift()

    result.push({
      content: title,
      id: doc._id,
      type: "lvl1",
      url: slug,
      pathname: doc.pathname || "",
      slug: params,
      hierarchy: {
        lvl1: title,
      },
    })

    // Process TOC items recursively
    const processTocItems = (
      items: TOC[],
      level: number = 2,
      parentTitle?: string,
    ) => {
      items.forEach((item) => {
        result.push({
          content: item.title,
          id: doc._id + item.url,
          type: `lvl${Math.min(level, 3)}` as any,
          url: slug + item.url,
          pathname: doc.pathname || "",
          slug: params,
          hierarchy: {
            lvl1: title,
            lvl2: level === 2 ? item.title : parentTitle,
            lvl3: level === 3 ? item.title : null,
          },
        })

        if (item.items && item.items.length > 0) {
          processTocItems(
            item.items,
            level + 1,
            level === 2 ? item.title : parentTitle,
          )
        }
      })
    }

    if (toc && Array.isArray(toc)) {
      processTocItems(toc)
    }
  }
  return result
}

export const searchData = getSearchMeta()
