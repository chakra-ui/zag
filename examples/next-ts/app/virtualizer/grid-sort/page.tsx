"use client"

import { mergeProps } from "@zag-js/react"
import { useLayoutEffect, useRef, useState } from "react"
import { useGridVirtualizer } from "@/hooks/use-virtualizer"

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

export default function Page() {
  const [rows, setRows] = useState(() => createRows(0, 1000))
  const headerRef = useRef<HTMLDivElement>(null)

  const { virtualizer, ref } = useGridVirtualizer({
    rowCount: rows.length,
    columnCount: COLUMNS,
    // heights come from the data, so a sort changes which height each row index has
    estimatedRowSize: (index) => rows[index].height,
    estimatedColumnSize: () => 100,
    indexToKey: (index) => rows[index].id,
    overscan: 3,
  })

  // column widths come from the header cells, measured once
  useLayoutEffect(() => {
    headerRef.current?.querySelectorAll<HTMLElement>("[data-header]").forEach((cell, column) => {
      virtualizer.measureColumn(column, cell.offsetWidth)
    })
  }, [virtualizer])

  const sortBy = (compare: (a: Row, b: Row) => number) => setRows((prev) => [...prev].sort(compare))

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => sortBy((a, b) => a.height - b.height || a.id - b.id)}>Sort by height</button>
        <button onClick={() => sortBy((a, b) => a.id - b.id)}>Sort by id</button>
        <button onClick={() => setRows((prev) => [...prev, ...createRows(prev.length, 200)])}>Load more</button>
      </div>
      <div style={{ width: 600, marginTop: 12, border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden" }}>
        {/* scrolled sideways with the grid */}
        <div ref={headerRef} style={{ overflow: "hidden", background: "#f3f4f6", borderBottom: "1px solid #d1d5db" }}>
          {/* the padding stands in for the grid's vertical scrollbar, so both scroll the same distance */}
          <div style={{ display: "flex", width: "max-content", paddingRight: 24 }}>
            {headerWidths.map((width, column) => (
              <div
                key={column}
                data-header
                style={{ width, flexShrink: 0, padding: "8px", boxSizing: "border-box", fontSize: 12, fontWeight: 600 }}
              >
                {column === 0 ? "Row" : column === 1 ? "Height" : `Column ${column + 1}`}
              </div>
            ))}
          </div>
        </div>
        <div
          ref={ref}
          {...mergeProps(virtualizer.getRootProps(), {
            style: { height: 400 },
            onScroll: (event: { currentTarget: HTMLElement }) => {
              if (headerRef.current) headerRef.current.scrollLeft = event.currentTarget.scrollLeft
            },
          })}
          aria-label="Rows"
        >
          <div {...virtualizer.getContentProps()}>
            {virtualizer.getVirtualRows().map((virtualRow) => {
              const row = rows[virtualRow.row]
              return (
                <div key={row.id} {...virtualizer.getRowProps(virtualRow)} data-testid="row" data-height={row.height}>
                  {virtualRow.columns.map((column) => (
                    <div
                      key={column.column}
                      {...mergeProps(virtualizer.getCellProps(virtualRow, column), {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          padding: "0 8px",
                          boxSizing: "border-box",
                          borderBottom: "1px solid #e5e7eb",
                          borderRight: "1px solid #f3f4f6",
                          background: virtualRow.row % 2 ? "#fafafa" : "#fff",
                          fontSize: 12,
                        },
                      })}
                    >
                      {column.column === 0 ? (
                        <strong>#{row.id}</strong>
                      ) : column.column === 1 ? (
                        `${row.height}px`
                      ) : (
                        `${row.id}.${column.column}`
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <p style={{ margin: "12px 0 4px", fontSize: 13, color: "#6b7280" }}>
        Row heights come from the data; column widths are measured from the header once.
      </p>
      <pre>
        {JSON.stringify({
          totalHeight: virtualizer.getTotalHeight(),
          trueHeight: rows.reduce((sum, row) => sum + row.height, 0),
          totalWidth: virtualizer.getTotalWidth(),
          trueWidth: headerWidths.reduce((sum, width) => sum + width, 0),
        })}
      </pre>
    </main>
  )
}
