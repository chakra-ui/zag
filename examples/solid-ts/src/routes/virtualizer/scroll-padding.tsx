import { createSignal, Index } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

const ITEM_COUNT = 1000
const ITEM_HEIGHT = 40

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index + 1}`,
}))

export default function Page() {
  const [scrollPaddingStart, setScrollPaddingStart] = createSignal(64)
  const [scrollPaddingEnd, setScrollPaddingEnd] = createSignal(64)

  const { virtualizer, ref } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => ITEM_HEIGHT,
    scrollPaddingStart: 64,
    scrollPaddingEnd: 64,
    overscan: 5,
  })

  const updateScrollPadding = (start: number, end: number) => {
    setScrollPaddingStart(start)
    setScrollPaddingEnd(end)
    virtualizer.updateOptions({ scrollPaddingStart: start, scrollPaddingEnd: end })
  }

  return (
    <main style={{ padding: "20px", "max-width": "640px", width: "100%" }}>
      <h1>Scroll Padding Example</h1>
      <p style={{ color: "#64748b" }}>
        <code>scrollPaddingStart</code> and <code>scrollPaddingEnd</code> reserve viewport space when scrolling to an
        item. The blue bands show the reserved alignment zones.
      </p>

      <div style={{ display: "flex", gap: "12px", "margin-top": "16px", "align-items": "center", "flex-wrap": "wrap" }}>
        <label>
          scrollPaddingStart:{" "}
          <input
            type="number"
            value={scrollPaddingStart()}
            onInput={(event) => updateScrollPadding(Number(event.currentTarget.value), scrollPaddingEnd())}
            style={{ width: "64px" }}
          />
          px
        </label>
        <label>
          scrollPaddingEnd:{" "}
          <input
            type="number"
            value={scrollPaddingEnd()}
            onInput={(event) => updateScrollPadding(scrollPaddingStart(), Number(event.currentTarget.value))}
            style={{ width: "64px" }}
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

      <div style={{ display: "flex", gap: "8px", "margin-top": "12px", "flex-wrap": "wrap" }}>
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
          height: "400px",
          width: "100%",
          overflow: "auto",
          border: "1px solid #e2e8f0",
          "border-radius": "8px",
          "margin-top": "16px",
          "box-sizing": "border-box",
          background: `linear-gradient(to bottom, #dbeafe ${scrollPaddingStart()}px, transparent ${scrollPaddingStart()}px, transparent calc(100% - ${scrollPaddingEnd()}px), #dbeafe calc(100% - ${scrollPaddingEnd()}px))`,
        }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <Index each={virtualizer.getVirtualItems()}>
            {(virtualItem) => (
              <div
                style={{
                  ...virtualizer.getItemStyle(virtualItem()),
                  height: `${ITEM_HEIGHT}px`,
                  padding: "0 16px",
                  "border-bottom": "1px solid #cbd5e1",
                  "box-sizing": "border-box",
                  "background-color":
                    virtualItem().index % 2 === 0 ? "rgba(248, 250, 252, 0.92)" : "rgba(226, 232, 240, 0.92)",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "space-between",
                }}
              >
                <span>{items[virtualItem().index].label}</span>
                <span style={{ color: "#64748b", "font-size": "12px" }}>y: {virtualItem().start}px</span>
              </div>
            )}
          </Index>
        </div>
      </div>

      <p style={{ "margin-top": "12px", "font-size": "13px", color: "#64748b" }}>
        Scroll padding: {scrollPaddingStart()}px start, {scrollPaddingEnd()}px end. Total size stays{" "}
        {virtualizer.getTotalSize()}px.
      </p>
    </main>
  )
}
