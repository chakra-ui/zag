import { createSignal, For, onSettled, untrack } from "solid-js"
import { mergeProps } from "@zag-js/solid"
import { useGridVirtualizer } from "../../hooks/use-virtualizer"

interface Row {
  id: number
  height: number
}

const createRows = (from: number, count: number): Row[] =>
  Array.from({ length: count }, (_, index) => {
    const id = from + index
    return { id, height: 30 + ((id * 37) % 7) * 20 }
  })

const COLUMNS = 6
const headerWidths = [90, 140, 110, 160, 100, 130]

const headerLabel = (column: number) => (column === 0 ? "Row" : column === 1 ? "Height" : `Column ${column + 1}`)
const cellText = (row: Row, column: number) =>
  column === 0 ? `#${row.id}` : column === 1 ? `${row.height}px` : `${row.id}.${column}`

export default function Page() {
  const [rows, setRows] = createSignal(createRows(0, 1000))
  let headerEl: HTMLDivElement | undefined
  let rootEl: HTMLDivElement | undefined

  // read the rows once here, where they're tracked; the callbacks close over the plain array
  const { virtualizer, ref } = useGridVirtualizer(() => {
    const list = rows()
    return {
      rowCount: list.length,
      columnCount: COLUMNS,
      // heights come from the data, so a sort changes which height each row index has
      estimatedRowSize: (index: number) => list[index].height,
      estimatedColumnSize: () => 100,
      indexToKey: (index: number) => list[index].id,
      overscan: 3,
    }
  })

  onSettled(() => {
    // column widths come from the header cells, measured once
    headerEl?.querySelectorAll<HTMLElement>("[data-header]").forEach((cell, column) => {
      virtualizer().measureColumn(column, cell.offsetWidth)
    })

    // scroll doesn't bubble, so it's listened to on the grid itself
    const syncHeader = () => {
      if (headerEl && rootEl) headerEl.scrollLeft = rootEl.scrollLeft
    }
    rootEl?.addEventListener("scroll", syncHeader, { passive: true })
    return () => rootEl?.removeEventListener("scroll", syncHeader)
  })

  const sortBy = (compare: (a: Row, b: Row) => number) => setRows((prev) => [...prev].sort(compare))

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <button onClick={() => sortBy((a, b) => a.height - b.height || a.id - b.id)}>Sort by height</button>
        <button onClick={() => sortBy((a, b) => a.id - b.id)}>Sort by id</button>
        <button onClick={() => setRows((prev) => [...prev, ...createRows(prev.length, 200)])}>Load more</button>
      </div>
      <div
        style={{
          width: "600px",
          "margin-top": "12px",
          border: "1px solid #d1d5db",
          "border-radius": "6px",
          overflow: "hidden",
        }}
      >
        {/* scrolled sideways with the grid */}
        <div
          ref={(el) => (headerEl = el)}
          style={{ overflow: "hidden", background: "#f3f4f6", "border-bottom": "1px solid #d1d5db" }}
        >
          {/* the padding stands in for the grid's vertical scrollbar, so both scroll the same distance */}
          <div style={{ display: "flex", width: "max-content", "padding-right": "24px" }}>
            <For each={headerWidths}>
              {(width, column) => (
                <div
                  data-header
                  style={{
                    width: `${width}px`,
                    "flex-shrink": 0,
                    padding: "8px",
                    "box-sizing": "border-box",
                    "font-size": "12px",
                    "font-weight": 600,
                  }}
                >
                  {headerLabel(column())}
                </div>
              )}
            </For>
          </div>
        </div>
        <div
          ref={(el) => {
            rootEl = el
            ref(el)
          }}
          {...mergeProps(() => virtualizer().getRootProps(), { style: { height: "400px" } })}
          aria-label="Rows"
        >
          <div {...virtualizer().getContentProps()}>
            <For keyed={false} each={virtualizer().getVirtualRows()}>
              {(virtualRow) => (
                <div
                  {...virtualizer().getRowProps(virtualRow())}
                  data-testid="row"
                  data-height={rows()[virtualRow().row].height}
                >
                  <For keyed={false} each={virtualRow().columns}>
                    {(column) => (
                      <div
                        {...mergeProps(
                          () => virtualizer().getCellProps(virtualRow(), column()),
                          () => ({
                            style: {
                              display: "flex",
                              "align-items": "center",
                              padding: "0 8px",
                              "box-sizing": "border-box",
                              "border-bottom": "1px solid #e5e7eb",
                              "border-right": "1px solid #f3f4f6",
                              background: virtualRow().row % 2 ? "#fafafa" : "#fff",
                              "font-size": "12px",
                              "font-weight": column().column === 0 ? 600 : 400,
                            },
                          }),
                        )}
                      >
                        {cellText(rows()[virtualRow().row], column().column)}
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <p style={{ margin: "12px 0 4px", "font-size": "13px", color: "#6b7280" }}>
        Row heights come from the data; column widths are measured from the header once.
      </p>
      <pre>
        {JSON.stringify({
          totalHeight: virtualizer().getTotalHeight(),
          // untracked: the virtualizer updates from the same rows right after, and re-renders this
          trueHeight: untrack(rows).reduce((sum, row) => sum + row.height, 0),
          totalWidth: virtualizer().getTotalWidth(),
          trueWidth: headerWidths.reduce((sum, width) => sum + width, 0),
        })}
      </pre>
    </main>
  )
}
