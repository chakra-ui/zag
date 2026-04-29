import { createInfiniteScroll } from "@zag-js/infinite-scroll"
import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"

const PAGE_SIZE = 50
const TOTAL = 5000

const loadPage = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE
      resolve(Array.from({ length: PAGE_SIZE }, (_, i) => `Row ${start + i + 1}`))
    }, 500)
  })

export default function Page() {
  const [items, setItems] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)

  const hasMore = items.length < TOTAL

  // Add a placeholder slot at the end while there's more to load.
  // The virtualizer renders that slot as our sentinel.
  const count = hasMore ? items.length + 1 : items.length

  const virtualizer = useMemo(
    () =>
      new ListVirtualizer({
        count,
        estimatedSize: () => 44,
        overscan: 5,
      }),
    [count],
  )

  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const scrollRef = useRef<HTMLDivElement>(null)

  const setScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el
      if (el) virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  useEffect(() => {
    const lastItem = virtualItems.at(-1)
    if (!lastItem || !scrollRef.current) return

    // The sentinel is the last virtual row when more data is available.
    const sentinelEl = scrollRef.current.querySelector<HTMLElement>(`[data-index="${lastItem.index}"]`)
    if (!sentinelEl) return

    return createInfiniteScroll({
      sentinelEl,
      scrollerEl: scrollRef.current,
      hasMore,
      loading,
      onLoadMore: async () => {
        setLoading(true)
        const next = await loadPage(page)
        setItems((prev) => [...prev, ...next])
        setPage((p) => p + 1)
        setLoading(false)
      },
    })
  }, [virtualItems, hasMore, loading, page])

  return (
    <main className="infinite-scroll">
      <h1>Infinite Scroll — Virtualized</h1>
      <p>
        Loaded {items.length} / {TOTAL}
      </p>
      <div
        ref={setScrollRef}
        onScroll={virtualizer.handleScroll}
        {...virtualizer.getContainerAriaAttrs()}
        style={{
          ...virtualizer.getContainerStyle(),
          height: 400,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <div style={{ height: totalSize, width: "100%", position: "relative" }}>
          {virtualItems.map((virtualItem) => {
            const isSentinelRow = hasMore && virtualItem.index === items.length
            const style = virtualizer.getItemStyle(virtualItem)
            return (
              <div
                key={virtualItem.index}
                data-index={virtualItem.index}
                {...virtualizer.getItemAriaAttrs(virtualItem.index)}
                style={{
                  ...style,
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                  color: isSentinelRow ? "#888" : undefined,
                }}
              >
                {isSentinelRow ? (loading ? "Loading…" : "") : items[virtualItem.index]}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
