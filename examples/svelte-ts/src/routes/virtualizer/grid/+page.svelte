<script lang="ts">
  import { useGridVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import { normalizeProps } from "@zag-js/svelte"

  // Grid configuration
  const TOTAL_ROWS = 1000
  const TOTAL_COLUMNS = 50
  const CELL_WIDTH = 120
  const CELL_HEIGHT = 40

  const estimateRowSize = () => CELL_HEIGHT
  const estimateColumnSize = () => CELL_WIDTH

  const generateCellData = (row: number, col: number) => ({
    id: `${row}-${col}`,
    value: `R${row + 1}C${col + 1}`,
    color: `hsl(${((row + col) * 37) % 360}, 60%, 90%)`,
  })

  let isSmooth = $state(true)

  const { virtualizer, init } = useGridVirtualizer({
    rowCount: TOTAL_ROWS,
    columnCount: TOTAL_COLUMNS,
    estimatedRowSize: estimateRowSize,
    estimatedColumnSize: estimateColumnSize,
    overscan: 3,
    gap: 0,
    paddingStart: 0,
    paddingEnd: 0,
    observeScrollElementSize: true,
  })

  const totalWidth = $derived(virtualizer.getTotalWidth())
  const totalHeight = $derived(virtualizer.getTotalHeight())
  const range = $derived(virtualizer.getRange())
  const visibleRowCount = $derived(range.endRow - range.startRow + 1)
  const visibleColCount = $derived(range.endColumn - range.startColumn + 1)
  const renderedCellCount = $derived(visibleRowCount * visibleColCount)

  const behavior = () => (isSmooth ? "smooth" : "auto")
  const isHeader = (row: number, col: number) => row === 0 || col === 0
</script>

<main class="grid-virtualizer">
  <div style="padding: 20px">
    <h1>Grid Virtualizer Example</h1>
    <p>
      Virtualizing a {TOTAL_ROWS.toLocaleString()} x {TOTAL_COLUMNS} grid ({(
        TOTAL_ROWS * TOTAL_COLUMNS
      ).toLocaleString()}
      cells)
    </p>
    <p style="font-size: 14px; color: #666">
      Row-first architecture: renders rows as containers, cells inside. One measurement per row, not per cell.
    </p>

    <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; user-select: none">
      <input type="checkbox" bind:checked={isSmooth} />
      Smooth scroll
    </label>

    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px">
      <button type="button" onclick={() => virtualizer.scrollToCell(0, 0, { behavior: behavior() })}>
        Scroll to Top-Left
      </button>
      <button
        type="button"
        onclick={() =>
          virtualizer.scrollToCell(Math.floor(TOTAL_ROWS / 2), Math.floor(TOTAL_COLUMNS / 2), {
            behavior: behavior(),
          })}
      >
        Scroll to Center
      </button>
      <button
        type="button"
        onclick={() => virtualizer.scrollToCell(TOTAL_ROWS - 1, TOTAL_COLUMNS - 1, { behavior: behavior() })}
      >
        Scroll to Bottom-Right
      </button>
    </div>

    <div
      {@attach init}
      onscroll={virtualizer.handleScroll}
      {...virtualizer.getContainerAriaAttrs()}
      tabindex="0"
      aria-label="Virtualized grid"
      {...normalizeProps.element({
        style: {
          height: "500px",
          width: "100%",
          maxWidth: "900px",
          ...virtualizer.getContainerStyle(),
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "16px",
        },
      })}
    >
      <div style="width: {totalWidth}px; height: {totalHeight}px; position: relative">
        {#each virtualizer.getVirtualRows() as virtualRow (virtualRow.row)}
          <div
            {@attach (el) => {
              virtualRow.measureRow(el)
              return () => virtualRow.measureRow(null)
            }}
            {...virtualizer.getRowAriaAttrs(virtualRow.row)}
            {...normalizeProps.element({ style: virtualizer.getRowStyle(virtualRow) })}
          >
            {#each virtualRow.columns as col (col.column)}
              {@const data = generateCellData(virtualRow.row, col.column)}
              <div
                {...virtualizer.getCellAriaAttrs(virtualRow.row, col.column)}
                {...normalizeProps.element({
                  style: {
                    ...virtualizer.getCellStyleInRow(col),
                    backgroundColor: data.color,
                    border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: isHeader(virtualRow.row, col.column) ? "bold" : "normal",
                    color: isHeader(virtualRow.row, col.column) ? "#333" : "#666",
                    boxSizing: "border-box",
                  },
                })}
              >
                {data.value}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <!-- Stats -->
    <div
      style="margin-top: 16px; padding: 16px; background-color: #f5f5f5; border-radius: 8px; font-size: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px"
    >
      <div><strong>Grid Size:</strong> {TOTAL_ROWS.toLocaleString()} rows x {TOTAL_COLUMNS} cols</div>
      <div><strong>Total Cells:</strong> {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()}</div>
      <div><strong>Rendered Cells:</strong> {renderedCellCount}</div>
      <div><strong>Visible Rows:</strong> {range.startRow} - {range.endRow} ({visibleRowCount} rows)</div>
      <div><strong>Visible Cols:</strong> {range.startColumn} - {range.endColumn} ({visibleColCount} cols)</div>
      <div><strong>Total Size:</strong> {totalWidth}px x {totalHeight}px</div>
      <div style="grid-column: 1 / -1">
        {#if renderedCellCount < 500}
          <span style="color: green">
            Virtualization working! Only {renderedCellCount} of {(TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()} cells rendered
          </span>
        {:else}
          <span style="color: orange">Many cells rendered</span>
        {/if}
      </div>
    </div>
  </div>
</main>
