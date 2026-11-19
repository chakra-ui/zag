"use client"

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- Keyboard-scrollable region. */

import { useCallback, useState } from "react"
import { useTableVirtualizer } from "@/hooks/use-virtualizer"

const TOTAL_ROWS = 2000
const PAGE_SIZE = 200
const METRIC_COLUMNS = 60

const columns = [
  { id: "name", label: "Name", width: 180 },
  ...Array.from({ length: METRIC_COLUMNS }, (_, i) => ({ id: `m${i}`, label: `Metric ${i + 1}`, width: 110 })),
]

const allRows = Array.from({ length: TOTAL_ROWS }, (_, index) => ({
  id: `row-${index}`,
  name: `Customer ${index + 1}`,
  values: Array.from({ length: METRIC_COLUMNS }, (_, i) => (index * 31 + i * 17) % 1000),
}))

const getColumnSize = (index: number) => columns[index].width
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const cellStyle = { padding: "8px 12px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" } as const

export default function Page() {
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [active, setActive] = useState({ row: 0, column: 1 })
  const hasMore = loadedCount < TOTAL_ROWS
  const rows = allRows.slice(0, loadedCount)

  const onEndReached = useCallback(async () => {
    await wait(400)
    setLoadedCount((count) => Math.min(count + PAGE_SIZE, TOTAL_ROWS))
  }, [])

  const { virtualizer, ref, rootProps } = useTableVirtualizer({
    count: rows.length,
    estimatedItemSize: 37,
    footerSize: hasMore ? 40 : 0,
    columnCount: columns.length,
    columnSize: getColumnSize,
    pinnedColumns: { start: 1 },
    retainedIndexes: [active.row],
    onEndReached: hasMore ? onEndReached : undefined,
    endReachedThreshold: 20,
  })

  const virtualColumns = virtualizer.getVirtualColumns()
  const startColumns = virtualColumns.filter((column) => column.pinned === "start")
  const middleColumns = virtualColumns.filter((column) => !column.pinned)

  const moveActive = (row: number, column: number) => {
    const next = {
      row: Math.max(0, Math.min(rows.length - 1, row)),
      column: Math.max(1, Math.min(columns.length - 1, column)),
    }
    setActive(next)
    virtualizer.scrollToIndex(next.row)
    virtualizer.scrollToColumn(next.column)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const { row, column } = active
    const moves: Record<string, [number, number]> = {
      ArrowDown: [row + 1, column],
      ArrowUp: [row - 1, column],
      ArrowRight: [row, column + 1],
      ArrowLeft: [row, column - 1],
      PageDown: [row + 10, column],
      PageUp: [row - 10, column],
      Home: [row, 1],
      End: [row, columns.length - 1],
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    moveActive(...move)
  }

  return (
    <main style={{ padding: 20, maxWidth: 960, width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <h1>Table</h1>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Rows and columns are windowed in a real table. The name column is pinned. Arrow keys, Page Up/Down, Home and End
        move the active cell.
      </p>

      <div
        ref={ref}
        {...rootProps}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        role="region"
        aria-label="Customers"
        onKeyDown={onKeyDown}
        style={{
          ...rootProps.style,
          height: "min(420px, calc(var(--total-size) + 2px))",
          width: "100%",
          overflow: "auto",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <table
          aria-rowcount={hasMore ? -1 : rows.length + 1}
          aria-colcount={columns.length}
          style={{ ...virtualizer.getTableStyle(), fontSize: 13 }}
        >
          <colgroup>
            {startColumns.map((column) => (
              <col key={column.index} style={virtualizer.getColumnStyle(column)} />
            ))}
            <col style={virtualizer.getColumnSpacerStyle("start")} />
            {middleColumns.map((column) => (
              <col key={column.index} style={virtualizer.getColumnStyle(column)} />
            ))}
            <col style={virtualizer.getColumnSpacerStyle("end")} />
          </colgroup>
          <thead ref={virtualizer.measureHeaderElement}>
            <tr aria-rowindex={1}>
              {[startColumns, null, middleColumns, null].map((group, i) =>
                group === null ? (
                  <th key={`spacer-${i}`} aria-hidden style={virtualizer.getColumnSpacerStyle(i ? "end" : "start")} />
                ) : (
                  group.map((column) => (
                    <th
                      key={column.index}
                      aria-colindex={column.index + 1}
                      style={{
                        ...cellStyle,
                        ...virtualizer.getCellStyle(column),
                        position: "sticky",
                        top: 0,
                        zIndex: column.pinned ? 3 : 2,
                        background: "#f8fafc",
                        textAlign: "left",
                      }}
                    >
                      {columns[column.index].label}
                    </th>
                  ))
                ),
              )}
            </tr>
          </thead>
          <tbody aria-hidden>
            <tr style={virtualizer.getRowSpacerStyle("start")} />
          </tbody>
          <tbody style={virtualizer.getBodyStyle()}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index]
              const isActiveRow = item.index === active.row
              const background = isActiveRow ? "#eff6ff" : item.index % 2 ? "#f8fafc" : "#fff"
              return (
                <tr
                  key={row.id}
                  ref={item.measureElement}
                  data-index={item.index}
                  aria-rowindex={item.index + 2}
                  style={{ ...virtualizer.getRowStyle(item), background }}
                >
                  {startColumns.map((column) => (
                    <th
                      key={column.index}
                      scope="row"
                      aria-colindex={column.index + 1}
                      style={{ ...cellStyle, ...virtualizer.getCellStyle(column), background, textAlign: "left" }}
                    >
                      {row.name}
                    </th>
                  ))}
                  <td aria-hidden style={virtualizer.getColumnSpacerStyle("start")} />
                  {middleColumns.map((column) => {
                    const isActive = isActiveRow && column.index === active.column
                    return (
                      <td
                        key={column.index}
                        aria-colindex={column.index + 1}
                        data-active={isActive ? "" : undefined}
                        onClick={() => setActive({ row: item.index, column: column.index })}
                        style={{ ...cellStyle, background: isActive ? "#bfdbfe" : undefined }}
                      >
                        {row.values[column.index - 1]}
                      </td>
                    )
                  })}
                  <td aria-hidden style={virtualizer.getColumnSpacerStyle("end")} />
                </tr>
              )
            })}
          </tbody>
          <tbody aria-hidden>
            <tr style={virtualizer.getRowSpacerStyle("end")} />
          </tbody>
          {hasMore && (
            <tbody>
              <tr style={{ height: 40 }}>
                <td colSpan={virtualColumns.length + 2} style={{ padding: "0 12px", color: "#64748b" }}>
                  Loading more…
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
        Loaded {rows.length} of {TOTAL_ROWS} rows · Rendered {virtualizer.getVirtualItems().length} rows ×{" "}
        {virtualColumns.length} columns · Active {active.row + 1}:{columns[active.column].label}
      </p>
    </main>
  )
}
