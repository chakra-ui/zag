"use client"

import { useScrollSpy } from "lib/use-scrollspy"
import Link from "next/link"
import { docsNav } from "styled-system/recipes"

type TOC = Array<{
  content: string
  slug: string
  lvl: number
}>

export function TableOfContents({
  data = [],
  title = "On this page",
  getSlug = (slug) => `#${slug}`,
}: {
  data: TOC
  title?: string
  getSlug?: (slug: string) => string
}) {
  const activeId = useScrollSpy(data.map((item) => `[id="${item.slug}"]`))

  const styles = docsNav({ variant: "toc" })

  return (
    <nav className={`toc ${styles.root}`} aria-labelledby="toc-heading">
      <h5 id="toc-heading" className={styles.heading}>
        {title}
      </h5>
      <ul className={styles.list}>
        {data.map((item, index) => (
          <li key={item.slug + index}>
            <Link
              href={getSlug(item.slug)}
              aria-current={activeId === item.slug ? "location" : undefined}
              data-depth={item.lvl > 2 ? "nested" : undefined}
              className={styles.link}
            >
              {item.content}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
