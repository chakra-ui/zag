import { mergeProps } from "@zag-js/solid"
import type { TableColumn } from "@zag-js/virtualizer"
import { createMemo, createSignal, For, Show } from "solid-js"
import { useTableVirtualizer } from "~/hooks/use-virtualizer"

const TOTAL_ROWS = 2000
const PAGE_SIZE = 200
const METRIC_COLUMNS = 60

const columns = [
  { id: "name", label: "Name", width: 180 },
  ...Array.from({ length: METRIC_COLUMNS }, (_, i) => ({
    id: `m${i}`,
    label: `Metric ${i + 1}`,
    width: 110,
  })),
]

const allRows = Array.from({ length: TOTAL_ROWS }, (_, index) => ({
  id: `row-${index}`,
  name: `Customer ${index + 1}`,
  values: Array.from({ length: METRIC_COLUMNS }, (_, i) => (index * 31 + i * 17) % 1000),
}))

const getColumnSize = (index: number) => columns[index].width
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const cellStyle = {
  padding: "8px 12px",
  "border-bottom": "1px solid #e2e8f0",
  "white-space": "nowrap",
}

const headerCellStyle = (column: TableColumn) => ({
  ...cellStyle,
  position: "sticky",
  top: "0",
  "z-index": column.pinned ? 3 : 2,
  background: "#f8fafc",
  "text-align": "left",
})

export default function Page() {
  const [loadedCount, setLoadedCount] = createSignal(PAGE_SIZE)
  const [active, setActive] = createSignal({ row: 0, column: 1 })
  const hasMore = () => loadedCount() < TOTAL_ROWS
  const rows = createMemo(() => allRows.slice(0, loadedCount()))

  const onEndReached = async () => {
    await wait(400)
    setLoadedCount((count) => Math.min(count + PAGE_SIZE, TOTAL_ROWS))
  }

  const { virtualizer, ref } = useTableVirtualizer(() => ({
    count: rows().length,
    estimatedItemSize: 37,
    footerSize: hasMore() ? 40 : 0,
    columnCount: columns.length,
    columnSize: getColumnSize,
    pinnedColumns: { start: 1 },
    retainedIndexes: [active().row],
    onEndReached: hasMore() ? onEndReached : undefined,
    endReachedThreshold: 20,
  }))

  const virtualColumns = () => virtualizer().getVirtualColumns()
  const startColumns = () => virtualColumns().filter((column) => column.pinned === "start")
  const middleColumns = () => virtualColumns().filter((column) => !column.pinned)

  const moveActive = (row: number, column: number) => {
    const next = {
      row: Math.max(0, Math.min(rows().length - 1, row)),
      column: Math.max(1, Math.min(columns.length - 1, column)),
    }
    setActive(next)
    virtualizer().scrollToIndex(next.row)
    virtualizer().scrollToColumn(next.column)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const { row, column } = active()
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
    <main
      style={{
        padding: "20px",
        "max-width": "960px",
        width: "100%",
        "min-width": "0",
        "box-sizing": "border-box",
      }}
    >
      <h1>Table</h1>
      <p style={{ color: "#64748b", "font-size": "14px" }}>
        Rows and columns are windowed in a real table. The name column is pinned. Arrow keys, Page Up/Down, Home and End
        move the active cell.
      </p>

      <div
        ref={ref}
        {...mergeProps(() => virtualizer().getRootProps(), {
          style: {
            height: "min(420px, calc(var(--total-size) + 2px))",
            width: "100%",
            border: "1px solid #cbd5e1",
            "border-radius": "8px",
            "margin-top": "16px",
          },
        })}
        role="region"
        aria-label="Customers"
        onKeyDown={onKeyDown}
      >
        <table
          aria-rowcount={hasMore() ? -1 : rows().length + 1}
          aria-colcount={columns.length}
          {...mergeProps(() => virtualizer().getTableProps(), { style: { "font-size": "13px" } })}
        >
          <colgroup>
            <For each={startColumns()}>{(column) => <col {...virtualizer().getColumnProps(column)} />}</For>
            <col {...virtualizer().getColumnSpacerProps("start")} />
            <For each={middleColumns()}>{(column) => <col {...virtualizer().getColumnProps(column)} />}</For>
            <col {...virtualizer().getColumnSpacerProps("end")} />
          </colgroup>
          <thead {...virtualizer().getHeaderProps()}>
            <tr aria-rowindex={1}>
              <For each={startColumns()}>
                {(column) => (
                  <th {...mergeProps(() => virtualizer().getCellProps(column), { style: headerCellStyle(column) })}>
                    {columns[column.index].label}
                  </th>
                )}
              </For>
              <th {...virtualizer().getColumnSpacerProps("start")} />
              <For each={middleColumns()}>
                {(column) => (
                  <th {...mergeProps(() => virtualizer().getCellProps(column), { style: headerCellStyle(column) })}>
                    {columns[column.index].label}
                  </th>
                )}
              </For>
              <th {...virtualizer().getColumnSpacerProps("end")} />
            </tr>
          </thead>
          <tbody aria-hidden="true">
            <tr {...virtualizer().getRowSpacerProps("start")} />
          </tbody>
          <tbody {...virtualizer().getBodyProps()}>
            <For each={virtualizer().getVirtualItems()}>
              {(item) => {
                const row = rows()[item.index]
                const isActiveRow = () => item.index === active().row
                const background = () => (isActiveRow() ? "#eff6ff" : item.index % 2 ? "#f8fafc" : "#fff")
                return (
                  <tr
                    aria-rowindex={item.index + 2}
                    {...mergeProps(
                      () => virtualizer().getRowProps(item),
                      () => ({ style: { background: background() } }),
                    )}
                  >
                    <For each={startColumns()}>
                      {(column) => (
                        <th
                          scope="row"
                          {...mergeProps(
                            () => virtualizer().getCellProps(column),
                            () => ({ style: { ...cellStyle, background: background(), "text-align": "left" } }),
                          )}
                        >
                          {row.name}
                        </th>
                      )}
                    </For>
                    <td {...virtualizer().getColumnSpacerProps("start")} />
                    <For each={middleColumns()}>
                      {(column) => {
                        const isActive = () => isActiveRow() && column.index === active().column
                        return (
                          <td
                            {...mergeProps(
                              () => virtualizer().getCellProps(column),
                              () => ({ style: { ...cellStyle, background: isActive() ? "#bfdbfe" : undefined } }),
                            )}
                            data-active={isActive() ? "" : undefined}
                            onClick={() => setActive({ row: item.index, column: column.index })}
                          >
                            {row.values[column.index - 1]}
                          </td>
                        )
                      }}
                    </For>
                    <td {...virtualizer().getColumnSpacerProps("end")} />
                  </tr>
                )
              }}
            </For>
          </tbody>
          <tbody aria-hidden="true">
            <tr {...virtualizer().getRowSpacerProps("end")} />
          </tbody>
          <Show when={hasMore()}>
            <tbody>
              <tr style={{ height: "40px" }}>
                <td colspan={virtualColumns().length + 2} style={{ padding: "0 12px", color: "#64748b" }}>
                  Loading more…
                </td>
              </tr>
            </tbody>
          </Show>
        </table>
      </div>

      <p style={{ "margin-top": "12px", "font-size": "13px", color: "#64748b" }}>
        Loaded {rows().length} of {TOTAL_ROWS} rows · Rendered {virtualizer().getVirtualItems().length} rows ×{" "}
        {virtualColumns().length} columns · Active {active().row + 1}:{columns[active().column].label}
      </p>
    </main>
  )
}
