import { Index, createMemo } from "solid-js"
import { useWindowVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 10_000

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
}))

export default function Page() {
  const { virtualizer, ref, version } = useWindowVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => 72,
    overscan: 8,
  })

  const layout = createMemo(() => {
    version()
    return {
      virtualItems: virtualizer.getVirtualItems(),
      totalSize: virtualizer.getTotalSize(),
    }
  })

  return (
    <main style={{ padding: "20px", width: "100%", "max-width": "960px" }}>
      <h1>Window Virtualizer</h1>
      <p style={{ color: "#64748b" }}>Uses the page scroll container instead of an explicit scrolling element.</p>

      <div
        ref={ref}
        {...virtualizer.getContainerAriaAttrs()}
        style={{
          ...virtualizer.getContainerStyle(),
          width: "100%",
          border: "1px solid #d1d5db",
          "border-radius": "8px",
          "margin-top": "16px",
        }}
      >
        <div style={{ height: `${layout().totalSize}px`, width: "100%", position: "relative" }}>
          <Index each={layout().virtualItems}>
            {(virtualItem) => (
              <div
                data-index={virtualItem().index}
                style={{
                  ...virtualizer.getItemStyle(virtualItem()),
                  padding: "12px 16px",
                  "border-bottom": "1px solid #e5e7eb",
                  background: virtualItem().index % 2 === 0 ? "#f8fafc" : "#fff",
                }}
              >
                {items[virtualItem().index]?.name}
              </div>
            )}
          </Index>
        </div>
      </div>
    </main>
  )
}
