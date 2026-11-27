"use client"

import { mergeProps } from "@zag-js/react"
import { useState } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"

interface Row {
  id: number
  height: number
}

// heights come from the data, so the list's true size is known
const rows: Row[] = Array.from({ length: 2000 }, (_, id) => ({ id, height: 30 + ((id * 37) % 7) * 20 }))

export default function Page() {
  const [items, setItems] = useState(rows)
  const [target, setTarget] = useState(1000)

  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    estimatedItemSize: 48,
    overscan: 4,
    indexToKey: (index) => items[index].id,
  })

  const sortBy = (compare: (a: Row, b: Row) => number) => setItems((prev) => [...prev].sort(compare))

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => sortBy((a, b) => a.height - b.height || a.id - b.id)}>Sort by height</button>
        <button onClick={() => sortBy((a, b) => a.id - b.id)}>Sort by id</button>
        <button onClick={() => setItems((prev) => [...prev].reverse())}>Reverse</button>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Row
          <input
            type="number"
            value={target}
            min={0}
            max={items.length - 1}
            style={{ width: 80 }}
            onChange={(e) => setTarget(e.currentTarget.valueAsNumber)}
          />
        </label>
        <button onClick={() => virtualizer.scrollToIndex(target, { align: "start" })}>Scroll to row</button>
      </div>
      <div
        ref={ref}
        {...mergeProps(virtualizer.getRootProps(), {
          style: { height: 400, width: 360, border: "1px solid #ccc", marginTop: 12 },
        })}
        aria-label="Rows"
      >
        <div {...virtualizer.getContentProps()}>
          {virtualizer.getVirtualItems().map((item) => {
            const row = items[item.index]
            return (
              <div key={item.key} {...virtualizer.getItemProps(item)} data-testid="row">
                <div
                  style={{
                    height: row.height,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    borderBottom: "1px solid #e5e7eb",
                    background: `hsl(${200 + row.height}, 70%, 97%)`,
                    boxSizing: "border-box",
                    fontSize: 13,
                  }}
                >
                  <strong>#{row.id}</strong>
                  <span style={{ color: "#6b7280" }}>{row.height}px tall</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p style={{ margin: "12px 0 4px", fontSize: 13, color: "#6b7280" }}>
        The virtualizer's size against the true size. Rows not yet measured use the estimate.
      </p>
      <pre>
        {JSON.stringify({
          totalSize: virtualizer.getTotalSize(),
          trueSize: items.reduce((sum, row) => sum + row.height, 0),
        })}
      </pre>
    </main>
  )
}
