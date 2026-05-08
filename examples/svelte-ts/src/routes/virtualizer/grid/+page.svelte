<script lang="ts">
  import { useGridVirtualizer } from "$lib/use-virtualizer.svelte"

  const ROW_COUNT = 1_000
  const COLUMN_COUNT = 50
  const CELL_HEIGHT = 40
  const CELL_WIDTH = 120

  let scrollEl = $state<HTMLDivElement | null>(null)

  const { virtualizer, init } = useGridVirtualizer({
    rowCount: ROW_COUNT,
    columnCount: COLUMN_COUNT,
    estimatedRowSize: () => CELL_HEIGHT,
    estimatedColumnSize: () => CELL_WIDTH,
    overscan: 3,
    observeScrollElementSize: true,
  })

  $effect(() => {
    init(scrollEl)
  })

  const getCellValue = (row: number, column: number) => `R${row + 1}C${column + 1}`
</script>

<main style="padding: 20px; width: 100%; max-width: 960px">
  <h1>Grid Virtualizer</h1>
  <p style="color: #64748b">Virtualizing {ROW_COUNT.toLocaleString()} rows x {COLUMN_COUNT} columns.</p>

  <div
    bind:this={scrollEl}
    onscroll={virtualizer.handleScroll}
    role="grid"
    tabindex="0"
    aria-label="Virtualized grid"
    style="height: 520px; width: 100%; overflow: auto; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 16px; position: relative;"
  >
    <div style={`height: ${virtualizer.getTotalHeight()}px; width: ${virtualizer.getTotalWidth()}px; position: relative`}>
      {#each virtualizer.getVirtualRows() as virtualRow (`row-${virtualRow.row}`)}
        <div
          style={`position: absolute; top: ${virtualRow.y}px; left: 0; width: ${virtualizer.getTotalWidth()}px; height: ${virtualRow.height}px;`}
        >
          {#each virtualRow.columns as column (`${virtualRow.row}-${column.column}`)}
            <div
              style={`position: absolute; top: 0; left: ${column.x}px; width: ${column.width}px; height: ${virtualRow.height}px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; background: ${(virtualRow.row + column.column) % 2 === 0 ? "#fff" : "#f8fafc"}; box-sizing: border-box;`}
            >
              {getCellValue(virtualRow.row, column.column)}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</main>
