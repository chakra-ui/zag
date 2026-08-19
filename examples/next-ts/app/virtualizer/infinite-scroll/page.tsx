"use client"

import type { Range } from "@zag-js/virtualizer"
import { useCallback, useMemo, useRef, useState } from "react"
import { useLoadMoreSentinel } from "@/hooks/use-load-more-sentinel"
import { useListVirtualizer } from "@/hooks/use-virtualizer"

const TOTAL_ITEMS = 1000
const PAGE_SIZE = 50
const ROW_HEIGHT = 56
const LOADER_HEIGHT = 48

const allItems = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
  id: `item-${index}`,
  title: `Issue ${index + 1}`,
  status: index % 3 === 0 ? "Triaged" : index % 3 === 1 ? "In progress" : "Backlog",
}))

function getRangeIndexes(range: Range) {
  const indexes: number[] = []
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    indexes.push(i)
  }
  return indexes
}

export default function Page() {
  const loaderRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(false)

  const items = useMemo(() => allItems.slice(0, loadedCount), [loadedCount])
  const hasMore = loadedCount < allItems.length
  const loaderIndex = items.length
  const count = items.length + (hasMore ? 1 : 0)

  const estimatedSize = useCallback(
    (index: number) => (index === loaderIndex ? LOADER_HEIGHT : ROW_HEIGHT),
    [loaderIndex],
  )

  const rangeExtractor = useCallback(
    (range: Range) => {
      const indexes = getRangeIndexes(range)
      if (hasMore && range.endIndex >= items.length - 6) {
        indexes.push(loaderIndex)
      }
      return indexes
    },
    [hasMore, items.length, loaderIndex],
  )

  const { virtualizer, ref } = useListVirtualizer({
    count,
    estimatedSize,
    overscan: 4,
    rangeExtractor,
  })

  virtualizer.updateOptions({
    count,
    estimatedSize,
    rangeExtractor,
  })

  const virtualItems = virtualizer.getVirtualItems()

  useLoadMoreSentinel(loaderRef, {
    collectionKey: virtualItems,
    onLoadMore() {
      if (!hasMore || loadingRef.current) return

      loadingRef.current = true
      setIsLoading(true)
      window.setTimeout(() => {
        loadingRef.current = false
        setIsLoading(false)
        setLoadedCount((count) => Math.min(count + PAGE_SIZE, allItems.length))
      }, 500)
    },
  })

  return (
    <main style={{ padding: 20, maxWidth: 720, width: "100%" }}>
      <h1>Infinite Scroll + Virtualized</h1>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Loaded {items.length} of {TOTAL_ITEMS} rows. The loader row is injected with <code>rangeExtractor</code> when
        the rendered range approaches the end.
      </p>

      <div
        ref={ref}
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
          {virtualItems.map((virtualItem) => {
            const isLoader = virtualItem.index === loaderIndex
            const item = items[virtualItem.index]

            return (
              <div
                ref={isLoader ? loaderRef : undefined}
                key={isLoader ? "loader" : item.id}
                style={{
                  ...virtualizer.getItemStyle(virtualItem),
                  height: virtualItem.size,
                  padding: "0 16px",
                  borderBottom: "1px solid #e2e8f0",
                  boxSizing: "border-box",
                  background: isLoader ? "#f8fafc" : virtualItem.index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                {isLoader ? (
                  <span role="status" aria-live="polite" style={{ color: "#64748b" }}>
                    {isLoading ? "Loading more..." : "Scroll for more"}
                  </span>
                ) : (
                  <>
                    <strong>{item.title}</strong>
                    <span style={{ color: "#64748b", fontSize: 13 }}>{item.status}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
        Rendered: {virtualItems.length} rows
        {hasMore ? ` · Next page starts at ${items.length + 1}` : " · Complete"}
      </p>
    </main>
  )
}
