import Link from "next/link"
import { paginate } from "lib/pagination-utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useFramework } from "./framework"
import * as styles from "./pagination.css"

export function usePagination() {
  const { framework } = useFramework()
  const asPath = usePathname()
  const { prev, next } = paginate({ framework, current: asPath })
  return {
    prev,
    next,
    hasPrev: !!prev,
    hasNext: !!next,
  }
}

function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}

type PageLink = NonNullable<ReturnType<typeof usePagination>["prev"]>

function PageLink(props: { item: PageLink; rel: "prev" | "next" }) {
  const { item, rel } = props
  return (
    <Link href={item.url} rel={rel} className={styles.link}>
      <span className={styles.label}>
        {rel === "prev" ? "Previous" : "Next"}
      </span>
      <span className={styles.title} data-title>
        {item.label}
      </span>
    </Link>
  )
}

export function Pagination() {
  const { prev, next } = usePagination()
  const isClient = useIsClient()

  if (!isClient || (!prev && !next)) return null

  return (
    <nav aria-label="Pagination" className={styles.root}>
      {prev && <PageLink item={prev} rel="prev" />}
      {next && <PageLink item={next} rel="next" />}
    </nav>
  )
}
