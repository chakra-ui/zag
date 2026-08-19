import { Index, createSignal } from "solid-js"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 10_000

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
  description: `This is the description for item ${index + 1}`,
}))

export default function Page() {
  const [smoothScroll, setSmoothScroll] = createSignal(true)
  const { virtualizer, ref } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => 64,
    overscan: 6,
  })

  return (
    <main style={{ padding: "20px", width: "100%", "max-width": "900px" }}>
      <h1>List Virtualizer</h1>
      <p style={{ color: "#64748b" }}>Efficiently render {ITEM_COUNT.toLocaleString()} rows.</p>

      <label
        style={{ display: "flex", "align-items": "center", gap: "8px", "margin-top": "12px", "user-select": "none" }}
      >
        <input
          type="checkbox"
          checked={smoothScroll()}
          onChange={(event) => setSmoothScroll(event.currentTarget.checked)}
        />
        Smooth scroll
      </label>

      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "margin-top": "12px" }}>
        <button type="button" onClick={() => virtualizer.scrollToIndex(0, { smooth: smoothScroll() })}>
          Scroll to top
        </button>
        <button
          type="button"
          onClick={() =>
            virtualizer.scrollToIndex(Math.floor(ITEM_COUNT / 2), { align: "center", smooth: smoothScroll() })
          }
        >
          Scroll to middle
        </button>
        <button type="button" onClick={() => virtualizer.scrollToIndex(ITEM_COUNT - 1, { smooth: smoothScroll() })}>
          Scroll to bottom
        </button>
      </div>

      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        {...virtualizer.getContainerAriaAttrs()}
        tabIndex={0}
        aria-label="Virtualized list"
        style={{
          ...virtualizer.getContainerStyle(),
          width: "100%",
          height: "420px",
          border: "1px solid #d1d5db",
          "border-radius": "8px",
          "margin-top": "16px",
        }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <Index each={virtualizer.getVirtualItems()}>
            {(virtualItem) => (
              <div
                data-index={virtualItem().index}
                {...virtualizer.getItemAriaAttrs(virtualItem().index)}
                style={{
                  ...virtualizer.getItemStyle(virtualItem()),
                  padding: "12px 16px",
                  "border-bottom": "1px solid #e5e7eb",
                  background: virtualItem().index % 2 === 0 ? "#f8fafc" : "#fff",
                }}
              >
                <strong>{items[virtualItem().index].name}</strong>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>{items[virtualItem().index].description}</p>
              </div>
            )}
          </Index>
        </div>
      </div>
    </main>
  )
}
