import { createInfiniteScroll, getSentinelProps } from "@zag-js/infinite-scroll"
import { useEffect, useRef, useState } from "react"

const PAGE_SIZE = 20
const TOTAL = 200

const loadPage = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE
      resolve(Array.from({ length: PAGE_SIZE }, (_, i) => `Item ${start + i + 1}`))
    }, 600)
  })

export default function Page() {
  const [items, setItems] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)

  const sentinelRef = useRef<HTMLLIElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const hasMore = items.length < TOTAL

  useEffect(() => {
    if (!sentinelRef.current || !scrollerRef.current) return
    return createInfiniteScroll({
      sentinelEl: sentinelRef.current,
      scrollerEl: scrollerRef.current,
      hasMore,
      loading,
      threshold: "100px",
      onLoadMore: async () => {
        setLoading(true)
        const next = await loadPage(page)
        setItems((prev) => [...prev, ...next])
        setPage((p) => p + 1)
        setLoading(false)
      },
    })
  }, [hasMore, loading, page])

  return (
    <main className="infinite-scroll">
      <h1>Infinite Scroll — Basic</h1>
      <p>
        Loaded {items.length} / {TOTAL}
      </p>
      <div
        ref={scrollerRef}
        style={{
          height: 320,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {items.map((label, i) => (
            <li
              key={i}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #eee",
              }}
            >
              {label}
            </li>
          ))}
          <li ref={sentinelRef} {...getSentinelProps()} />
        </ul>
        <div style={{ padding: 12, textAlign: "center", color: "#666" }}>
          {loading && "Loading…"}
          {!loading && !hasMore && "End of list"}
        </div>
      </div>
    </main>
  )
}
