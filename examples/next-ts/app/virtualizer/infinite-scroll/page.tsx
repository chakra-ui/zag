"use client"

import { mergeProps } from "@zag-js/react"
import { useCallback, useMemo, useRef, useState } from "react"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { useListVirtualizer } from "@/hooks/use-virtualizer"

const TOTAL_ITEMS = 1000
const PAGE_SIZE = 50
const ROW_HEIGHT = 56

const allItems = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
  id: `item-${index}`,
  title: `Issue ${index + 1}`,
  status: index % 3 === 0 ? "Triaged" : index % 3 === 1 ? "In progress" : "Backlog",
}))

const estimateSize = () => ROW_HEIGHT
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Page() {
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const items = useMemo(() => allItems.slice(0, loadedCount), [loadedCount])

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    estimatedSize: estimateSize,
    overscan: 4,
  })
  const setScroller = useCallback(
    (el: HTMLDivElement | null) => {
      scrollerRef.current = el
      ref(el)
    },
    [ref],
  )

  const api = useInfiniteScroll({
    count: items.length,
    hasMore: loadedCount < TOTAL_ITEMS,
    scrollEl: () => scrollerRef.current,
    // The returned promise drives the loading state
    async onLoadMore() {
      await wait(500)
      setLoadedCount((count) => Math.min(count + PAGE_SIZE, TOTAL_ITEMS))
    },
  })

  return (
    <main style={{ padding: 20, maxWidth: 720, width: "100%" }}>
      <h1>Infinite Scroll + Virtualized</h1>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Loaded {items.length} of {TOTAL_ITEMS} rows. The infinite-scroll sentinel sits after the virtual rows, so it is
        always mounted.
      </p>

      <div
        ref={setScroller}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Virtualized infinite list"
        style={{
          height: 420,
          width: "100%",
          overflow: "auto",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          marginTop: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index]
            if (!item) return null
            return (
              <div
                key={item.id}
                style={{
                  ...virtualizer.getItemStyle(virtualItem),
                  height: virtualItem.size,
                  padding: "0 16px",
                  borderBottom: "1px solid #e2e8f0",
                  boxSizing: "border-box",
                  background: virtualItem.index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <strong>{item.title}</strong>
                <span style={{ color: "#64748b", fontSize: 13 }}>{item.status}</span>
              </div>
            )
          })}
        </div>

        <div {...mergeProps(api.getSentinelProps(), { style: { height: 1 } })} />
        <div {...api.getIndicatorProps({ type: "loading" })} style={{ padding: 12, color: "#64748b" }}>
          Loading more…
        </div>
        <div {...api.getIndicatorProps({ type: "complete" })} style={{ padding: 12, color: "#64748b" }}>
          You&apos;re all caught up
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
        Rendered: {virtualizer.getVirtualItems().length} rows
        {loadedCount < TOTAL_ITEMS ? ` · Next page starts at ${items.length + 1}` : " · Complete"}
      </p>
    </main>
  )
}
