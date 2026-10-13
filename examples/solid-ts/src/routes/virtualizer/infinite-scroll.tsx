import { getNearestOverflowAncestor } from "@zag-js/dom-query"
import type { Range } from "@zag-js/virtualizer"
import { createEffect, createSignal, Index, on, onCleanup, Show } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

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
  let loading = false
  const [loaderEl, setLoaderEl] = createSignal<HTMLElement | null>(null)
  const [loadedCount, setLoadedCount] = createSignal(PAGE_SIZE)
  const [isLoading, setIsLoading] = createSignal(false)

  const items = () => allItems.slice(0, loadedCount())
  const hasMore = () => loadedCount() < allItems.length
  const loaderIndex = () => loadedCount()
  const count = () => loadedCount() + (hasMore() ? 1 : 0)

  // Options are read lazily, so these always see the latest signals
  const estimatedSize = (index: number) => (index === loaderIndex() ? LOADER_HEIGHT : ROW_HEIGHT)
  const rangeExtractor = (range: Range) => {
    const indexes = getRangeIndexes(range)
    if (hasMore() && range.endIndex >= loadedCount() - 6) {
      indexes.push(loaderIndex())
    }
    return indexes
  }

  const { virtualizer, ref } = useListVirtualizer({
    count: count(),
    estimatedSize,
    overscan: 4,
    rangeExtractor,
  })

  createEffect(
    on(count, (count) => virtualizer.updateOptions({ count, estimatedSize, rangeExtractor }), { defer: true }),
  )

  const onLoadMore = () => {
    if (!hasMore() || loading) return
    loading = true
    setIsLoading(true)
    window.setTimeout(() => {
      loading = false
      setIsLoading(false)
      setLoadedCount((count) => Math.min(count + PAGE_SIZE, allItems.length))
    }, 500)
  }

  createEffect(() => {
    const sentinel = loaderEl()
    virtualizer.getVirtualItems()
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onLoadMore()
        }
      },
      { root: getNearestOverflowAncestor(sentinel), rootMargin: "0px 100% 100% 100%" },
    )
    observer.observe(sentinel)
    onCleanup(() => observer.disconnect())
  })

  return (
    <main style={{ padding: "20px", "max-width": "720px", width: "100%" }}>
      <h1>Infinite Scroll + Virtualized</h1>
      <p style={{ color: "#64748b", "font-size": "14px" }}>
        Loaded {items().length} of {TOTAL_ITEMS} rows. The loader row is injected with <code>rangeExtractor</code> when
        the rendered range approaches the end.
      </p>

      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Virtualized infinite list"
        style={{
          height: "420px",
          width: "100%",
          overflow: "auto",
          border: "1px solid #cbd5e1",
          "border-radius": "8px",
          "margin-top": "16px",
          "box-sizing": "border-box",
        }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <Index each={virtualizer.getVirtualItems()}>
            {(virtualItem) => {
              const isLoader = () => virtualItem().index === loaderIndex()
              const item = () => items()[virtualItem().index]
              let el!: HTMLDivElement
              createEffect(() => {
                if (isLoader()) setLoaderEl(el)
                else if (loaderEl() === el) setLoaderEl(null)
              })
              return (
                <div
                  ref={el}
                  style={{
                    ...virtualizer.getItemStyle(virtualItem()),
                    height: `${virtualItem().size}px`,
                    padding: "0 16px",
                    "border-bottom": "1px solid #e2e8f0",
                    "box-sizing": "border-box",
                    background: isLoader() ? "#f8fafc" : virtualItem().index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "space-between",
                    gap: "16px",
                  }}
                >
                  <Show
                    when={!isLoader()}
                    fallback={
                      <span role="status" aria-live="polite" style={{ color: "#64748b" }}>
                        {isLoading() ? "Loading more..." : "Scroll for more"}
                      </span>
                    }
                  >
                    <strong>{item()?.title}</strong>
                    <span style={{ color: "#64748b", "font-size": "13px" }}>{item()?.status}</span>
                  </Show>
                </div>
              )
            }}
          </Index>
        </div>
      </div>

      <p style={{ "margin-top": "12px", "font-size": "13px", color: "#64748b" }}>
        Rendered: {virtualizer.getVirtualItems().length} rows
        {hasMore() ? ` · Next page starts at ${items().length + 1}` : " · Complete"}
      </p>
    </main>
  )
}
