"use client"

import { type TocEntry, useToc } from "lib/use-toc"
import * as styles from "./toc.css"

interface TableOfContentsProps {
  data: TocEntry[]
  title?: string
  getSlug?: (slug: string) => string
}

export function TableOfContents(props: TableOfContentsProps) {
  const {
    data = [],
    title = "On this page",
    getSlug = (slug) => `#${slug}`,
  } = props
  const api = useToc(data)

  return (
    <div className={styles.root} {...api.getRootProps()}>
      <nav {...api.getNavProps()}>
        <h2 className={styles.heading} {...api.getTitleProps()}>
          {title}
        </h2>
        {/* the indicator rect is measured from the list, so they share an origin */}
        <div className={styles.track}>
          <ul className={styles.list} {...api.getListProps()}>
            {data.map((entry) => {
              const item = { value: entry.slug, depth: entry.lvl }
              return (
                <li key={entry.slug} {...api.getItemProps({ item })}>
                  <a
                    href={getSlug(entry.slug)}
                    className={styles.link}
                    {...api.getLinkProps({ item })}
                  >
                    {entry.content}
                  </a>
                </li>
              )
            })}
          </ul>
          <div className={styles.indicator} {...api.getIndicatorProps()} />
        </div>
      </nav>
    </div>
  )
}
