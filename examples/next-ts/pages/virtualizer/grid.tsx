import { GridVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useReducer, useState } from "react"
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
  const [isSmooth, setIsSmooth] = useState(true)
  const [, rerender] = useReducer(() => ({}), {})
  const [virtualizer] = useState(() => {
    return new GridVirtualizer({
      rowCount: TOTAL_ROWS,
      columnCount: TOTAL_COLUMNS,
      estimatedRowSize: () => CELL_HEIGHT,
      estimatedColumnSize: () => CELL_WIDTH,
      overscan: 3,
      gap: 0,
      paddingStart: 0,
      paddingEnd: 0,
      observeScrollElementSize: true,
      onRangeChange: () => {
        flushSync(rerender)
      },
    })
  })

  const setScrollElementRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return
    virtualizer.init(element)
    rerender()
    return () => virtualizer.destroy()
  }, [])

  const virtualRows = virtualizer.getVirtualRows()
  const totalWidth = virtualizer.getTotalWidth()
  const totalHeight = virtualizer.getTotalHeight()
  const range = virtualizer.getRange()

  const visibleRowCount = range.endRow - range.startRow + 1
  const visibleColCount = range.endColumn - range.startColumn + 1
  const renderedCellCount = visibleRowCount * visibleColCount

  return (
    <main className="grid-virtualizer">
      <div style={{ padding: "20px" }}>
        <h1>Grid Virtualizer Example</h1>
        <p>
          Virtualizing a {TOTAL_ROWS.toLocaleString()} x {TOTAL_COLUMNS} grid (
          {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()} cells)
        </p>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Row-first architecture: renders rows as containers, cells inside. One measurement per row, not per cell.
        </p>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, userSelect: "none" }}>
          <input type="checkbox" checked={isSmooth} onChange={(e) => setIsSmooth(e.currentTarget.checked)} />
          Smooth scroll
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button
            type="button"
            onClick={() => virtualizer.scrollToCell(0, 0, { behavior: isSmooth ? "smooth" : "auto" })}
          >
            Scroll to Top-Left
          </button>
          <button
            type="button"
            onClick={() =>
              virtualizer.scrollToCell(Math.floor(TOTAL_ROWS / 2), Math.floor(TOTAL_COLUMNS / 2), {
                behavior: isSmooth ? "smooth" : "auto",
              })
            }
          >
            Scroll to Center
          </button>
          <button
            type="button"
            onClick={() =>
              virtualizer.scrollToCell(TOTAL_ROWS - 1, TOTAL_COLUMNS - 1, {
                behavior: isSmooth ? "smooth" : "auto",
              })
            }
          >
            Scroll to Bottom-Right
          </button>
        </div>

        <div
          ref={setScrollElementRef}
          onScroll={virtualizer.handleScroll}
          {...virtualizer.getContainerAriaAttrs()}
          style={{
            height: "500px",
            width: "100%",
            maxWidth: "900px",
            ...virtualizer.getContainerStyle(),
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          <div style={{ width: totalWidth, height: totalHeight, position: "relative" }}>
            {virtualRows.map((virtualRow) => (
              <div
                key={virtualRow.row}
                ref={virtualRow.measureRow}
                {...virtualizer.getRowAriaAttrs(virtualRow.row)}
                style={virtualizer.getRowStyle(virtualRow)}
              >
                {virtualRow.columns.map((col) => {
                  const data = generateCellData(virtualRow.row, col.column)
                  return (
                    <div
                      key={col.column}
                      {...virtualizer.getCellAriaAttrs(virtualRow.row, col.column)}
                      style={{
                        ...virtualizer.getCellStyleInRow(col),
                        backgroundColor: data.color,
                        border: "1px solid rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: virtualRow.row === 0 || col.column === 0 ? "bold" : "normal",
                        color: virtualRow.row === 0 || col.column === 0 ? "#333" : "#666",
                        boxSizing: "border-box",
                      }}
                    >
                      {data.value}
                    </div>
                  )
                })}
              </div>
            ))}
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
            <strong>Grid Size:</strong> {TOTAL_ROWS.toLocaleString()} rows x {TOTAL_COLUMNS} cols
          </div>
          <div>
            <strong>Total Cells:</strong> {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()}
          </div>
          <div>
            <strong>Rendered Cells:</strong> {renderedCellCount}
          </div>
          <div>
            <strong>Visible Rows:</strong> {range.startRow} - {range.endRow} ({visibleRowCount} rows)
          </div>
          <div>
            <strong>Visible Cols:</strong> {range.startColumn} - {range.endColumn} ({visibleColCount} cols)
          </div>
          <div>
            <strong>Total Size:</strong> {totalWidth}px x {totalHeight}px
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            {renderedCellCount < 500 ? (
              <span style={{ color: "green" }}>
                Virtualization working! Only {renderedCellCount} of {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()}{" "}
                cells rendered
              </span>
            ) : (
              <span style={{ color: "orange" }}>Many cells rendered</span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
