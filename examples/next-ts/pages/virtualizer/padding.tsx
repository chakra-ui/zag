import { useState } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 1000

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [paddingStart, setPaddingStart] = useState(40)
  const [paddingEnd, setPaddingEnd] = useState(40)

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

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <main style={{ padding: 20, maxWidth: 600, width: "100%" }}>
      <h1>Padding Example</h1>
      <p style={{ color: "#64748b" }}>
        <code>paddingStart</code> and <code>paddingEnd</code> add space before/after items. The blue regions show the
        padding areas.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
        <label>
          paddingStart:{" "}
          <input
            type="number"
            value={paddingStart}
            onChange={(e) => updatePadding(Number(e.target.value), paddingEnd)}
            style={{ width: 60 }}
          />
          px
        </label>
        <label>
          paddingEnd:{" "}
          <input
            type="number"
            value={paddingEnd}
            onChange={(e) => updatePadding(paddingStart, Number(e.target.value))}
            style={{ width: 60 }}
          />
          px
        </label>
        <button onClick={() => updatePadding(0, 0)}>No padding</button>
        <button onClick={() => updatePadding(80, 80)}>Large padding</button>
      </div>

      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        style={{ height: 400, overflow: "auto", border: "1px solid #e2e8f0", borderRadius: 8, marginTop: 16 }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
            background: `linear-gradient(to bottom, #dbeafe ${paddingStart}px, transparent ${paddingStart}px, transparent calc(100% - ${paddingEnd}px), #dbeafe calc(100% - ${paddingEnd}px))`,
          }}
        >
          {virtualItems.map((vi) => {
            const item = items[vi.index]
            return (
              <div
                key={vi.index}
                style={{
                  ...virtualizer.getItemStyle(vi),
                  height: 40,
                  padding: "0 16px",
                  borderBottom: "1px solid #cbd5e1",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.label}</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>y: {vi.start}px</span>
              </div>
            )
          })}
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
        Total size: {virtualizer.getTotalSize()}px (padding: {paddingStart} + {paddingEnd} = {paddingStart + paddingEnd}
        px)
      </p>
    </main>
  )
}
