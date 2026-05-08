import { Index, createMemo } from "solid-js"
import { useGridVirtualizer } from "../../hooks/use-virtualizer"

const ROW_COUNT = 1_000
const COLUMN_COUNT = 50
const CELL_HEIGHT = 40
const CELL_WIDTH = 120

function getCellValue(row: number, column: number) {
  return `R${row + 1}C${column + 1}`
}

export default function Page() {
  const { virtualizer, ref, version } = useGridVirtualizer({
    rowCount: ROW_COUNT,
    columnCount: COLUMN_COUNT,
    estimatedRowSize: () => CELL_HEIGHT,
    estimatedColumnSize: () => CELL_WIDTH,
    overscan: 3,
    observeScrollElementSize: true,
  })

  const layout = createMemo(() => {
    version()
    return {
      virtualRows: virtualizer.getVirtualRows(),
      totalHeight: virtualizer.getTotalHeight(),
      totalWidth: virtualizer.getTotalWidth(),
    }
  })

  return (
    <main style={{ padding: "20px", width: "100%", "max-width": "960px" }}>
      <h1>Grid Virtualizer</h1>
      <p style={{ color: "#64748b" }}>
        Virtualizing {ROW_COUNT.toLocaleString()} rows x {COLUMN_COUNT} columns.
      </p>

      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        {...virtualizer.getContainerAriaAttrs()}
        tabIndex={0}
        aria-label="Virtualized grid"
        style={{
          ...virtualizer.getContainerStyle(),
          width: "100%",
          height: "520px",
          border: "1px solid #d1d5db",
          "border-radius": "8px",
          "margin-top": "16px",
        }}
      >
        <div style={{ height: `${layout().totalHeight}px`, width: `${layout().totalWidth}px`, position: "relative" }}>
          <Index each={layout().virtualRows}>
            {(virtualRow) => (
              <div style={virtualizer.getRowStyle(virtualRow())}>
                <Index each={virtualRow().columns}>
                  {(column) => (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${column().x}px`,
                        width: `${column().width}px`,
                        height: `${virtualRow().height}px`,
                        border: "1px solid #e5e7eb",
                        "box-sizing": "border-box",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        "font-size": "12px",
                        background: (virtualRow().row + column().column) % 2 === 0 ? "#fff" : "#f8fafc",
                      }}
                    >
                      {getCellValue(virtualRow().row, column().column)}
                    </div>
                  )}
                </Index>
              </div>
            )}
          </Index>
        </div>
      </div>
    </main>
  )
}
