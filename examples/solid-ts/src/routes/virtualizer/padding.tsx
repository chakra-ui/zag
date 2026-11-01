import { createSignal, Index } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

const ITEM_COUNT = 1000

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [paddingStart, setPaddingStart] = createSignal(40)
  const [paddingEnd, setPaddingEnd] = createSignal(40)

  const { virtualizer, ref } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => 40,
    paddingStart: 40,
    paddingEnd: 40,
    overscan: 5,
  })

  const updatePadding = (start: number, end: number) => {
    setPaddingStart(start)
    setPaddingEnd(end)
    virtualizer.updateOptions({ paddingStart: start, paddingEnd: end })
  }

  return (
    <main style={{ padding: "20px", "max-width": "600px", width: "100%" }}>
      <h1>Padding Example</h1>
      <p style={{ color: "#64748b" }}>
        <code>paddingStart</code> and <code>paddingEnd</code> add space before/after items. The blue regions show the
        padding areas.
      </p>

      <div style={{ display: "flex", gap: "12px", "margin-top": "16px", "align-items": "center" }}>
        <label>
          paddingStart:{" "}
          <input
            type="number"
            value={paddingStart()}
            onInput={(e) => updatePadding(Number(e.currentTarget.value), paddingEnd())}
            style={{ width: "60px" }}
          />
          px
        </label>
        <label>
          paddingEnd:{" "}
          <input
            type="number"
            value={paddingEnd()}
            onInput={(e) => updatePadding(paddingStart(), Number(e.currentTarget.value))}
            style={{ width: "60px" }}
          />
          px
        </label>
        <button onClick={() => updatePadding(0, 0)}>No padding</button>
        <button onClick={() => updatePadding(80, 80)}>Large padding</button>
      </div>

      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Virtualized list with padding"
        style={{
          height: "400px",
          width: "100%",
          overflow: "auto",
          border: "1px solid #e2e8f0",
          "border-radius": "8px",
          "margin-top": "16px",
          "box-sizing": "border-box",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
            background: `linear-gradient(to bottom, #dbeafe ${paddingStart()}px, transparent ${paddingStart()}px, transparent calc(100% - ${paddingEnd()}px), #dbeafe calc(100% - ${paddingEnd()}px))`,
          }}
        >
          <Index each={virtualizer.getVirtualItems()}>
            {(vi) => (
              <div
                style={{
                  ...virtualizer.getItemStyle(vi()),
                  height: "40px",
                  padding: "0 16px",
                  "border-bottom": "1px solid #cbd5e1",
                  "box-sizing": "border-box",
                  "background-color": vi().index % 2 === 0 ? "#f8fafc" : "#e2e8f0",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "space-between",
                }}
              >
                <span>{items[vi().index].label}</span>
                <span style={{ color: "#94a3b8", "font-size": "12px" }}>y: {vi().start}px</span>
              </div>
            )}
          </Index>
        </div>
      </div>

      <p style={{ "margin-top": "12px", "font-size": "13px", color: "#64748b" }}>
        Total size: {virtualizer.getTotalSize()}px (padding: {paddingStart()} + {paddingEnd()} ={" "}
        {paddingStart() + paddingEnd()}
        px)
      </p>
    </main>
  )
}
