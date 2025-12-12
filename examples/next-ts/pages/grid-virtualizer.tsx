import { GridVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useLayoutEffect, useReducer, useRef } from "react"
import { flushSync } from "react-dom"

// Grid configuration
const TOTAL_ROWS = 1000
const TOTAL_COLUMNS = 50
const CELL_WIDTH = 120
const CELL_HEIGHT = 40

// Generate cell data
const generateCellData = (row: number, col: number) => ({
  id: `${row}-${col}`,
  value: `R${row + 1}C${col + 1}`,
  color: `hsl(${((row + col) * 37) % 360}, 60%, 90%)`,
})

export default function Page() {
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const virtualizerRef = useRef<GridVirtualizer | null>(null)
  const [, rerender] = useReducer(() => ({}), {})

  // Create virtualizer once
  if (!virtualizerRef.current) {
    virtualizerRef.current = new GridVirtualizer({
      rowCount: TOTAL_ROWS,
      columnCount: TOTAL_COLUMNS,
      estimatedRowSize: () => CELL_HEIGHT,
      estimatedColumnSize: () => CELL_WIDTH,
      overscan: { count: 3 },
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      observeScrollElementSize: true,
      onRangeChange: () => {
        if (!isInitializedRef.current) return
        flushSync(rerender)
      },
    })
  }

  const virtualizer = virtualizerRef.current

  // Callback ref to measure when element mounts
  const setScrollElementRef = useCallback((element: HTMLDivElement | null) => {
    scrollElementRef.current = element
    if (element && virtualizer) {
      virtualizer.init(element)
      isInitializedRef.current = true
      rerender()
    }
  }, [])

  // Cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      virtualizerRef.current?.destroy()
      virtualizerRef.current = null
      isInitializedRef.current = false
    }
  }, [])

  const virtualCells = virtualizer.getVirtualCells()
  const totalWidth = virtualizer.getTotalWidth()
  const totalHeight = virtualizer.getTotalHeight()
  const range = virtualizer.getRange()

  const visibleRows = range.endRow - range.startRow + 1
  const visibleCols = range.endColumn - range.startColumn + 1

  return (
    <main className="grid-virtualizer">
      <div style={{ padding: "20px" }}>
        <h1>Grid Virtualizer Example</h1>
        <p>
          Virtualizing a {TOTAL_ROWS.toLocaleString()} × {TOTAL_COLUMNS} grid (
          {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()} cells)
        </p>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Scroll both horizontally and vertically - only visible cells are rendered!
        </p>

        <div
          ref={setScrollElementRef}
          onScroll={(e) => {
            flushSync(() => {
              virtualizer.handleScroll(e)
            })
          }}
          style={{
            height: "500px",
            width: "100%",
            maxWidth: "900px",
            overflow: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          {/* Total scrollable area */}
          <div
            style={{
              width: totalWidth,
              height: totalHeight,
              position: "relative",
            }}
          >
            {/* Render only visible cells */}
            {virtualCells.map((cell) => {
              const data = generateCellData(cell.row, cell.column)
              const style = virtualizer.getCellStyle(cell)

              return (
                <div
                  key={data.id}
                  style={{
                    ...style,
                    backgroundColor: data.color,
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: cell.row === 0 || cell.column === 0 ? "bold" : "normal",
                    color: cell.row === 0 || cell.column === 0 ? "#333" : "#666",
                    boxSizing: "border-box",
                  }}
                >
                  {data.value}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            fontSize: "14px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <strong>Grid Size:</strong> {TOTAL_ROWS.toLocaleString()} rows × {TOTAL_COLUMNS} cols
          </div>
          <div>
            <strong>Total Cells:</strong> {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()}
          </div>
          <div>
            <strong>Rendered Cells:</strong> {virtualCells.length}
          </div>
          <div>
            <strong>Visible Rows:</strong> {range.startRow} - {range.endRow} ({visibleRows} rows)
          </div>
          <div>
            <strong>Visible Cols:</strong> {range.startColumn} - {range.endColumn} ({visibleCols} cols)
          </div>
          <div>
            <strong>Total Size:</strong> {totalWidth}px × {totalHeight}px
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            {virtualCells.length < 500 ? (
              <span style={{ color: "green" }}>
                ✅ Virtualization working! Only {virtualCells.length} of {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()}{" "}
                cells rendered
              </span>
            ) : (
              <span style={{ color: "orange" }}>⚠️ Many cells rendered</span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
