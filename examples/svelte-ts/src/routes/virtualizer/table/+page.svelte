<script lang="ts">
  import { useTableVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { normalizeProps } from "@zag-js/svelte"

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

  const { virtualizer, init, getRootProps } = useTableVirtualizer(() => ({
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

  const { measureHeaderElement } = virtualizer

  const virtualColumns = $derived(virtualizer.getVirtualColumns())
  const startColumns = $derived(virtualColumns.filter((column) => column.pinned === "start"))
  const middleColumns = $derived(virtualColumns.filter((column) => !column.pinned))

  const moveActive = (row: number, column: number) => {
    const next = {
      row: Math.max(0, Math.min(rows.length - 1, row)),
      column: Math.max(1, Math.min(columns.length - 1, column)),
    }
    active = next
    virtualizer.scrollToIndex(next.row)
    virtualizer.scrollToColumn(next.column)
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
    {@attach init}
    {...getRootProps()}
    onscroll={virtualizer.handleScroll}
    tabindex="0"
    role="region"
    aria-label="Customers"
    onkeydown={onKeyDown}
    style="{getRootProps()
      .style}; height: min(420px, calc(var(--total-size) + 2px)); width: 100%; overflow: auto; border: 1px solid #cbd5e1; border-radius: 8px; margin-top: 16px"
  >
    <table
      aria-rowcount={hasMore ? -1 : rows.length + 1}
      aria-colcount={columns.length}
      {...normalizeProps.element({ style: { ...virtualizer.getTableStyle(), fontSize: "13px" } })}
    >
      <colgroup>
        {#each startColumns as column (column.index)}
          <col {...normalizeProps.element({ style: virtualizer.getColumnStyle(column) })} />
        {/each}
        <col {...normalizeProps.element({ style: virtualizer.getColumnSpacerStyle("start") })} />
        {#each middleColumns as column (column.index)}
          <col {...normalizeProps.element({ style: virtualizer.getColumnStyle(column) })} />
        {/each}
        <col {...normalizeProps.element({ style: virtualizer.getColumnSpacerStyle("end") })} />
      </colgroup>
      <thead {@attach measureHeaderElement}>
        <tr aria-rowindex={1}>
          {#each [startColumns, null, middleColumns, null] as group, i (i)}
            {#if group === null}
              <th
                aria-hidden="true"
                {...normalizeProps.element({ style: virtualizer.getColumnSpacerStyle(i ? "end" : "start") })}
              ></th>
            {:else}
              {#each group as column (column.index)}
                <th
                  aria-colindex={column.index + 1}
                  {...normalizeProps.element({
                    style: {
                      ...cellStyle,
                      ...virtualizer.getCellStyle(column),
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
        <tr {...normalizeProps.element({ style: virtualizer.getRowSpacerStyle("start") })}></tr>
      </tbody>
      <tbody {...normalizeProps.element({ style: virtualizer.getBodyStyle() })}>
        {#each virtualizer.getVirtualItems() as item (rows[item.index].id)}
          {@const row = rows[item.index]}
          {@const isActiveRow = item.index === active.row}
          {@const background = isActiveRow ? "#eff6ff" : item.index % 2 ? "#f8fafc" : "#fff"}
          <tr
            {@attach (el) => item.measureElement(el)}
            data-index={item.index}
            aria-rowindex={item.index + 2}
            {...normalizeProps.element({ style: { ...virtualizer.getRowStyle(item), background } })}
          >
            {#each startColumns as column (column.index)}
              <th
                scope="row"
                aria-colindex={column.index + 1}
                {...normalizeProps.element({
                  style: { ...cellStyle, ...virtualizer.getCellStyle(column), background, textAlign: "left" },
                })}
              >
                {row.name}
              </th>
            {/each}
            <td aria-hidden="true" {...normalizeProps.element({ style: virtualizer.getColumnSpacerStyle("start") })}
            ></td>
            {#each middleColumns as column (column.index)}
              {@const isActive = isActiveRow && column.index === active.column}
              <td
                aria-colindex={column.index + 1}
                data-active={isActive ? "" : undefined}
                onclick={() => (active = { row: item.index, column: column.index })}
                {...normalizeProps.element({
                  style: { ...cellStyle, background: isActive ? "#bfdbfe" : undefined },
                })}
              >
                {row.values[column.index - 1]}
              </td>
            {/each}
            <td aria-hidden="true" {...normalizeProps.element({ style: virtualizer.getColumnSpacerStyle("end") })}></td>
          </tr>
        {/each}
      </tbody>
      <tbody aria-hidden="true">
        <tr {...normalizeProps.element({ style: virtualizer.getRowSpacerStyle("end") })}></tr>
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
    Loaded {rows.length} of {TOTAL_ROWS} rows · Rendered {virtualizer.getVirtualItems().length} rows × {virtualColumns.length}
    columns · Active {active.row + 1}:{columns[active.column].label}
  </p>
</main>
