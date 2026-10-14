import { mergeProps } from "@zag-js/solid"
import { createMemo, createSignal, Index, Show } from "solid-js"
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

const TOTAL_ITEMS = 1000
const PAGE_SIZE = 50
const ROW_HEIGHT = 56

const allItems = Array.from({ length: TOTAL_ITEMS }, (_, index) => ({
  id: `item-${index}`,
  title: `Issue ${index + 1}`,
  status: index % 3 === 0 ? "Triaged" : index % 3 === 1 ? "In progress" : "Backlog",
}))

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Page() {
  const [loadedCount, setLoadedCount] = createSignal(PAGE_SIZE)
  const items = createMemo(() => allItems.slice(0, loadedCount()))

  let scroller: HTMLDivElement | undefined
  const { virtualizer, ref } = useListVirtualizer(() => ({
    count: items().length,
    estimatedSize: () => ROW_HEIGHT,
    overscan: 4,
  }))

  const api = useInfiniteScroll(() => ({
    count: items().length,
    hasMore: loadedCount() < TOTAL_ITEMS,
    scrollEl: () => scroller ?? null,
    // The returned promise drives the loading state
    async onLoadMore() {
      await wait(500)
      setLoadedCount((count) => Math.min(count + PAGE_SIZE, TOTAL_ITEMS))
    },
  }))

  return (
    <main style={{ padding: "20px", "max-width": "720px", width: "100%" }}>
      <h1>Infinite Scroll + Virtualized</h1>
      <p style={{ color: "#64748b", "font-size": "14px" }}>
        Loaded {items().length} of {TOTAL_ITEMS} rows. The infinite-scroll sentinel sits after the virtual rows, so it
        is always mounted.
      </p>

      <div
        ref={(el) => {
          scroller = el
          ref(el)
        }}
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
            {(virtualItem) => (
              <Show when={items()[virtualItem().index]}>
                {(item) => (
                  <div
                    style={{
                      ...virtualizer.getItemStyle(virtualItem()),
                      height: `${virtualItem().size}px`,
                      padding: "0 16px",
                      "border-bottom": "1px solid #e2e8f0",
                      "box-sizing": "border-box",
                      background: virtualItem().index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "space-between",
                      gap: "16px",
                    }}
                  >
                    <strong>{item().title}</strong>
                    <span style={{ color: "#64748b", "font-size": "13px" }}>{item().status}</span>
                  </div>
                )}
              </Show>
            )}
          </Index>
        </div>

        <div {...mergeProps(api().getSentinelProps(), { style: { height: "1px" } })} />
        <div {...api().getIndicatorProps({ type: "loading" })} style={{ padding: "12px", color: "#64748b" }}>
          Loading more…
        </div>
        <div {...api().getIndicatorProps({ type: "complete" })} style={{ padding: "12px", color: "#64748b" }}>
          You're all caught up
        </div>
      </div>

      <p style={{ "margin-top": "12px", "font-size": "13px", color: "#64748b" }}>
        Rendered: {virtualizer.getVirtualItems().length} rows
        {loadedCount() < TOTAL_ITEMS ? ` · Next page starts at ${items().length + 1}` : " · Complete"}
      </p>
    </main>
  )
}
