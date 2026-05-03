import { useState } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 1000
const ITEM_HEIGHT = 40

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index + 1}`,
}))

export default function Page() {
  const [scrollPaddingStart, setScrollPaddingStart] = useState(64)
  const [scrollPaddingEnd, setScrollPaddingEnd] = useState(64)

  const { virtualizer, ref } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => ITEM_HEIGHT,
    scrollPaddingStart,
    scrollPaddingEnd,
    overscan: 5,
  })

  const updateScrollPadding = (start: number, end: number) => {
    setScrollPaddingStart(start)
    setScrollPaddingEnd(end)
    virtualizer.updateOptions({ scrollPaddingStart: start, scrollPaddingEnd: end })
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <main style={{ padding: 20, maxWidth: 640, width: "100%" }}>
      <h1>Scroll Padding Example</h1>
      <p style={{ color: "#64748b" }}>
        <code>scrollPaddingStart</code> and <code>scrollPaddingEnd</code> reserve viewport space when scrolling to an
        item. The blue bands show the reserved alignment zones.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          scrollPaddingStart:{" "}
          <input
            type="number"
            value={scrollPaddingStart}
            onChange={(event) => updateScrollPadding(Number(event.target.value), scrollPaddingEnd)}
            style={{ width: 64 }}
          />
          px
        </label>
        <label>
          scrollPaddingEnd:{" "}
          <input
            type="number"
            value={scrollPaddingEnd}
            onChange={(event) => updateScrollPadding(scrollPaddingStart, Number(event.target.value))}
            style={{ width: 64 }}
          />
          px
        </label>
        <button type="button" onClick={() => updateScrollPadding(0, 0)}>
          No padding
        </button>
        <button type="button" onClick={() => updateScrollPadding(96, 96)}>
          Large padding
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={() => virtualizer.scrollToIndex(250, { align: "start" })}>
          Item 251 start
        </button>
        <button type="button" onClick={() => virtualizer.scrollToIndex(500, { align: "center" })}>
          Item 501 center
        </button>
        <button type="button" onClick={() => virtualizer.scrollToIndex(750, { align: "end" })}>
          Item 751 end
        </button>
      </div>

      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Virtualized list with scroll padding"
        style={{
          height: 400,
          width: "100%",
          overflow: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          marginTop: 16,
          boxSizing: "border-box",
          background: `linear-gradient(to bottom, #dbeafe ${scrollPaddingStart}px, transparent ${scrollPaddingStart}px, transparent calc(100% - ${scrollPaddingEnd}px), #dbeafe calc(100% - ${scrollPaddingEnd}px))`,
        }}
      >
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            return (
              <div
                key={item.id}
                style={{
                  ...virtualizer.getItemStyle(virtualItem),
                  height: ITEM_HEIGHT,
                  padding: "0 16px",
                  borderBottom: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                  backgroundColor:
                    virtualItem.index % 2 === 0 ? "rgba(248, 250, 252, 0.92)" : "rgba(226, 232, 240, 0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.label}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}>y: {virtualItem.start}px</span>
              </div>
            )
          })}
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
        Scroll padding: {scrollPaddingStart}px start, {scrollPaddingEnd}px end. Total size stays{" "}
        {virtualizer.getTotalSize()}px.
      </p>
    </main>
  )
}
