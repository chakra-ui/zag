<script lang="ts">
  import { useGridVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { mergeProps } from "@zag-js/svelte"

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

  let rows = $state(createRows(0, 1000))
  let headerEl = $state<HTMLElement | null>(null)

  const id = $props.id()
  const vz = useGridVirtualizer(() => ({
    id,
    rowCount: rows.length,
    columnCount: COLUMNS,
    // heights come from the data, so a sort changes which height each row index has
    estimatedRowSize: (index: number) => rows[index].height,
    estimatedColumnSize: () => 100,
    indexToKey: (index: number) => rows[index].id,
    overscan: 3,
  }))

  // column widths come from the header cells, measured once
  $effect(() => {
    if (!headerEl) return
    headerEl.querySelectorAll<HTMLElement>("[data-header]").forEach((cell, column) => {
      vz.virtualizer.measureColumn(column, cell.offsetWidth)
    })
  })

  const sortBy = (compare: (a: Row, b: Row) => number) => (rows = [...rows].sort(compare))
  const headerLabel = (column: number) => (column === 0 ? "Row" : column === 1 ? "Height" : `Column ${column + 1}`)
  const cellText = (row: Row, column: number) =>
    column === 0 ? `#${row.id}` : column === 1 ? `${row.height}px` : `${row.id}.${column}`
  const totals = $derived({
    totalHeight: vz.virtualizer.getTotalHeight(),
    trueHeight: rows.reduce((sum, row) => sum + row.height, 0),
    totalWidth: vz.virtualizer.getTotalWidth(),
    trueWidth: headerWidths.reduce((sum, width) => sum + width, 0),
  })
</script>

<main style="padding: 20px">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <button onclick={() => sortBy((a, b) => a.height - b.height || a.id - b.id)}>Sort by height</button>
    <button onclick={() => sortBy((a, b) => a.id - b.id)}>Sort by id</button>
    <button onclick={() => (rows = [...rows, ...createRows(rows.length, 200)])}>Load more</button>
  </div>
  <div style="width: 600px; margin-top: 12px; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden">
    <!-- scrolled sideways with the grid -->
    <div bind:this={headerEl} style="overflow: hidden; background: #f3f4f6; border-bottom: 1px solid #d1d5db">
      <!-- the padding stands in for the grid's vertical scrollbar, so both scroll the same distance -->
      <div style="display: flex; width: max-content; padding-right: 24px">
        {#each headerWidths as width, column}
          <div
            data-header
            style="width: {width}px; flex-shrink: 0; padding: 8px; box-sizing: border-box; font-size: 12px; font-weight: 600"
          >
            {headerLabel(column)}
          </div>
        {/each}
      </div>
    </div>
    <div
      {@attach vz.init}
      {...mergeProps(vz.virtualizer.getRootProps(), {
        style: { height: "400px" },
        onscroll: (event: Event) => {
          if (headerEl) headerEl.scrollLeft = (event.currentTarget as HTMLElement).scrollLeft
        },
      })}
      aria-label="Rows"
    >
      <div {...vz.virtualizer.getContentProps()}>
        {#each vz.virtualizer.getVirtualRows() as virtualRow (rows[virtualRow.row].id)}
          {@const row = rows[virtualRow.row]}
          <div {...vz.virtualizer.getRowProps(virtualRow)} data-testid="row" data-height={row.height}>
            {#each virtualRow.columns as column (column.column)}
              <div
                {...mergeProps(vz.virtualizer.getCellProps(virtualRow, column), {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    boxSizing: "border-box",
                    borderBottom: "1px solid #e5e7eb",
                    borderRight: "1px solid #f3f4f6",
                    background: virtualRow.row % 2 ? "#fafafa" : "#fff",
                    fontSize: "12px",
                    fontWeight: column.column === 0 ? 600 : 400,
                  },
                })}
              >
                {cellText(row, column.column)}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
  <p style="margin: 12px 0 4px; font-size: 13px; color: #6b7280">
    Row heights come from the data; column widths are measured from the header once.
  </p>
  <pre>{JSON.stringify(totals)}</pre>
</main>
