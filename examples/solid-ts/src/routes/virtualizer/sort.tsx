import { createSignal, For, untrack } from "solid-js"
import { mergeProps } from "@zag-js/solid"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

interface Row {
  id: number
  height: number
}

// heights come from the data, so the list's true size is known
const rows: Row[] = Array.from({ length: 2000 }, (_, id) => ({ id, height: 30 + ((id * 37) % 7) * 20 }))

export default function Page() {
  const [items, setItems] = createSignal(rows)
  const [target, setTarget] = createSignal(1000)

  // read the list once here, where it's tracked; the callbacks close over the plain array
  const { virtualizer, ref } = useListVirtualizer(() => {
    const list = items()
    return {
      count: list.length,
      estimatedItemSize: 48,
      overscan: 4,
      indexToKey: (index: number) => list[index].id,
    }
  })

  const sortBy = (compare: (a: Row, b: Row) => number) => setItems((prev) => [...prev].sort(compare))

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <button onClick={() => sortBy((a, b) => a.height - b.height || a.id - b.id)}>Sort by height</button>
        <button onClick={() => sortBy((a, b) => a.id - b.id)}>Sort by id</button>
        <button onClick={() => setItems((prev) => [...prev].reverse())}>Reverse</button>
        <label style={{ display: "flex", "align-items": "center", gap: "6px" }}>
          Row
          <input
            type="number"
            value={target()}
            min={0}
            max={items().length - 1}
            style={{ width: "80px" }}
            onInput={(e) => setTarget(e.currentTarget.valueAsNumber)}
          />
        </label>
        <button onClick={() => virtualizer().scrollToIndex(target(), { align: "start" })}>Scroll to row</button>
      </div>
      <div
        ref={ref}
        {...mergeProps(() => virtualizer().getRootProps(), {
          style: { height: "400px", width: "360px", border: "1px solid #ccc", "margin-top": "12px" },
        })}
        aria-label="Rows"
      >
        <div {...virtualizer().getContentProps()}>
          <For each={virtualizer().getVirtualItems()}>
            {(item) => {
              const row = () => items()[item.index]
              return (
                <div {...virtualizer().getItemProps(item)} data-testid="row">
                  <div
                    style={{
                      height: `${row().height}px`,
                      display: "flex",
                      "align-items": "center",
                      gap: "8px",
                      padding: "0 12px",
                      "border-bottom": "1px solid #e5e7eb",
                      background: `hsl(${200 + row().height}, 70%, 97%)`,
                      "box-sizing": "border-box",
                      "font-size": "13px",
                    }}
                  >
                    <strong>#{row().id}</strong>
                    <span style={{ color: "#6b7280" }}>{row().height}px tall</span>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </div>
      <p style={{ margin: "12px 0 4px", "font-size": "13px", color: "#6b7280" }}>
        The virtualizer's size against the true size. Rows not yet measured use the estimate.
      </p>
      <pre>
        {JSON.stringify({
          totalSize: virtualizer().getTotalSize(),
          // untracked: the virtualizer updates from the same items right after, and re-renders this
          trueSize: untrack(items).reduce((sum, row) => sum + row.height, 0),
        })}
      </pre>
    </main>
  )
}
