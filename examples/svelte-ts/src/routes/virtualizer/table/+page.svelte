<script lang="ts">
  import { useTableVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

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

  const cellStyle = { padding: "8px 12px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }

  let loadedCount = $state(PAGE_SIZE)
  let active = $state({ row: 0, column: 1 })
  const hasMore = $derived(loadedCount < TOTAL_ROWS)
  const rows = $derived(allRows.slice(0, loadedCount))

  const onEndReached = async () => {
    await wait(400)
    loadedCount = Math.min(loadedCount + PAGE_SIZE, TOTAL_ROWS)
  }

  const id = $props.id()
  const vz = useTableVirtualizer(() => ({
    id,
    count: rows.length,
    estimatedItemSize: 37,
    footerSize: hasMore ? 40 : 0,
    columnCount: columns.length,
    columnSize: getColumnSize,
    pinnedColumns: { start: 1 },
    retainedIndexes: [active.row],
    onEndReached: hasMore ? onEndReached : undefined,
    endReachedThreshold: 20,
  }))

  const virtualColumns = $derived(vz.virtualizer.getVirtualColumns())
  const startColumns = $derived(virtualColumns.filter((column) => column.pinned === "start"))
  const middleColumns = $derived(virtualColumns.filter((column) => !column.pinned))

  const moveActive = (row: number, column: number) => {
    const next = {
      row: Math.max(0, Math.min(rows.length - 1, row)),
      column: Math.max(1, Math.min(columns.length - 1, column)),
    }
    active = next
    vz.virtualizer.scrollToIndex(next.row)
    vz.virtualizer.scrollToColumn(next.column)
  }

  const onKeyDown = (event: KeyboardEvent) => {
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
</script>

<main style="padding: 20px; max-width: 960px; width: 100%; min-width: 0; box-sizing: border-box">
  <h1>Table</h1>
  <p style="color: #64748b; font-size: 14px">
    Rows and columns are windowed in a real table. The name column is pinned. Arrow keys, Page Up/Down, Home and End
    move the active cell.
  </p>

  <div
    {@attach vz.init}
    {...mergeProps(vz.virtualizer.getRootProps(), {
      style: {
        height: "min(420px, calc(var(--total-size) + 2px))",
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        marginTop: "16px",
      },
    })}
    role="region"
    aria-label="Customers"
    onkeydown={onKeyDown}
  >
    <table
      aria-rowcount={hasMore ? -1 : rows.length + 1}
      aria-colcount={columns.length}
      {...mergeProps(vz.virtualizer.getTableProps(), { style: { fontSize: "13px" } })}
    >
      <colgroup>
        {#each startColumns as column (column.index)}
          <col {...vz.virtualizer.getColumnProps(column)} />
        {/each}
        <col {...vz.virtualizer.getColumnSpacerProps("start")} />
        {#each middleColumns as column (column.index)}
          <col {...vz.virtualizer.getColumnProps(column)} />
        {/each}
        <col {...vz.virtualizer.getColumnSpacerProps("end")} />
      </colgroup>
      <thead {...vz.virtualizer.getHeaderProps()}>
        <tr aria-rowindex={1}>
          {#each [startColumns, null, middleColumns, null] as group, i (i)}
            {#if group === null}
              <th {...vz.virtualizer.getColumnSpacerProps(i ? "end" : "start")}></th>
            {:else}
              {#each group as column (column.index)}
                <th
                  {...mergeProps(vz.virtualizer.getCellProps(column), {
                    style: {
                      ...cellStyle,
                      position: "sticky",
                      top: "0",
                      zIndex: column.pinned ? 3 : 2,
                      background: "#f8fafc",
                      textAlign: "left",
                    },
                  })}
                >
                  {columns[column.index].label}
                </th>
              {/each}
            {/if}
          {/each}
        </tr>
      </thead>
      <tbody aria-hidden="true">
        <tr {...vz.virtualizer.getRowSpacerProps("start")}></tr>
      </tbody>
      <tbody {...vz.virtualizer.getBodyProps()}>
        {#each vz.virtualizer.getVirtualItems() as item (rows[item.index].id)}
          {@const row = rows[item.index]}
          {@const isActiveRow = item.index === active.row}
          {@const background = isActiveRow ? "#eff6ff" : item.index % 2 ? "#f8fafc" : "#fff"}
          <tr
            {...mergeProps(vz.virtualizer.getRowProps(item), { style: { background } })}
            aria-rowindex={item.index + 2}
          >
            {#each startColumns as column (column.index)}
              <th
                scope="row"
                {...mergeProps(vz.virtualizer.getCellProps(column), {
                  style: { ...cellStyle, background, textAlign: "left" },
                })}
              >
                {row.name}
              </th>
            {/each}
            <td {...vz.virtualizer.getColumnSpacerProps("start")}></td>
            {#each middleColumns as column (column.index)}
              {@const isActive = isActiveRow && column.index === active.column}
              <td
                {...mergeProps(vz.virtualizer.getCellProps(column), {
                  style: { ...cellStyle, background: isActive ? "#bfdbfe" : undefined },
                })}
                data-active={isActive ? "" : undefined}
                onclick={() => (active = { row: item.index, column: column.index })}
              >
                {row.values[column.index - 1]}
              </td>
            {/each}
            <td {...vz.virtualizer.getColumnSpacerProps("end")}></td>
          </tr>
        {/each}
      </tbody>
      <tbody aria-hidden="true">
        <tr {...vz.virtualizer.getRowSpacerProps("end")}></tr>
      </tbody>
      {#if hasMore}
        <tbody>
          <tr style="height: 40px">
            <td colspan={virtualColumns.length + 2} style="padding: 0 12px; color: #64748b">Loading more…</td>
          </tr>
        </tbody>
      {/if}
    </table>
  </div>

  <p style="margin-top: 12px; font-size: 13px; color: #64748b">
    Loaded {rows.length} of {TOTAL_ROWS} rows · Rendered {vz.virtualizer.getVirtualItems().length} rows × {virtualColumns.length}
    columns · Active {active.row + 1}:{columns[active.column].label}
  </p>
</main>
