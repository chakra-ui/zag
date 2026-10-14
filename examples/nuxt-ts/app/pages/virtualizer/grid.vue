<script setup lang="ts">
import { useGridVirtualizer } from "~/composables/useVirtualizer"

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

const isSmooth = ref(true)

const { virtualizer, init } = useGridVirtualizer(() => ({
  rowCount: TOTAL_ROWS,
  columnCount: TOTAL_COLUMNS,
  estimatedRowSize: estimateRowSize,
  estimatedColumnSize: estimateColumnSize,
  overscan: 3,
  gap: 0,
  paddingStart: 0,
  paddingEnd: 0,
  observeScrollElementSize: true,
}))

const totalWidth = computed(() => virtualizer.getTotalWidth())
const totalHeight = computed(() => virtualizer.getTotalHeight())
const range = computed(() => virtualizer.getRange())
const visibleRowCount = computed(() => range.value.endRow - range.value.startRow + 1)
const visibleColCount = computed(() => range.value.endColumn - range.value.startColumn + 1)
const renderedCellCount = computed(() => visibleRowCount.value * visibleColCount.value)

const behavior = () => (isSmooth.value ? "smooth" : "auto")

const isHeader = (row: number, col: number) => row === 0 || col === 0
</script>

<template>
  <main class="grid-virtualizer">
    <div style="padding: 20px">
      <h1>Grid Virtualizer Example</h1>
      <p>
        Virtualizing a {{ TOTAL_ROWS.toLocaleString() }} x {{ TOTAL_COLUMNS }} grid ({{
          (TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString()
        }}
        cells)
      </p>
      <p style="font-size: 14px; color: #666">
        Row-first architecture: renders rows as containers, cells inside. One measurement per row, not per cell.
      </p>

      <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; user-select: none">
        <input v-model="isSmooth" type="checkbox" />
        Smooth scroll
      </label>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px">
        <button type="button" @click="virtualizer.scrollToCell(0, 0, { behavior: behavior() })">
          Scroll to Top-Left
        </button>
        <button
          type="button"
          @click="
            virtualizer.scrollToCell(Math.floor(TOTAL_ROWS / 2), Math.floor(TOTAL_COLUMNS / 2), {
              behavior: behavior(),
            })
          "
        >
          Scroll to Center
        </button>
        <button
          type="button"
          @click="virtualizer.scrollToCell(TOTAL_ROWS - 1, TOTAL_COLUMNS - 1, { behavior: behavior() })"
        >
          Scroll to Bottom-Right
        </button>
      </div>

      <div
        :ref="(el) => init(el as HTMLElement)"
        v-bind="virtualizer.getContainerAriaAttrs()"
        tabindex="0"
        aria-label="Virtualized grid"
        :style="{
          height: '500px',
          width: '100%',
          maxWidth: '900px',
          ...virtualizer.getContainerStyle(),
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginTop: '16px',
        }"
        @scroll="virtualizer.handleScroll"
      >
        <div :style="{ width: `${totalWidth}px`, height: `${totalHeight}px`, position: 'relative' }">
          <div
            v-for="virtualRow in virtualizer.getVirtualRows()"
            :key="virtualRow.row"
            :ref="(el) => virtualRow.measureRow(el as HTMLElement | null)"
            v-bind="virtualizer.getRowAriaAttrs(virtualRow.row)"
            :style="virtualizer.getRowStyle(virtualRow)"
          >
            <div
              v-for="col in virtualRow.columns"
              :key="col.column"
              v-bind="virtualizer.getCellAriaAttrs(virtualRow.row, col.column)"
              :style="{
                ...virtualizer.getCellStyleInRow(col),
                backgroundColor: generateCellData(virtualRow.row, col.column).color,
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: isHeader(virtualRow.row, col.column) ? 'bold' : 'normal',
                color: isHeader(virtualRow.row, col.column) ? '#333' : '#666',
                boxSizing: 'border-box',
              }"
            >
              {{ generateCellData(virtualRow.row, col.column).value }}
            </div>
          </div>
        </div>
      </div>

      <div
        style="
          margin-top: 16px;
          padding: 16px;
          background-color: #f5f5f5;
          border-radius: 8px;
          font-size: 14px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        "
      >
        <div><strong>Grid Size:</strong> {{ TOTAL_ROWS.toLocaleString() }} rows x {{ TOTAL_COLUMNS }} cols</div>
        <div><strong>Total Cells:</strong> {{ (TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString() }}</div>
        <div><strong>Rendered Cells:</strong> {{ renderedCellCount }}</div>
        <div><strong>Visible Rows:</strong> {{ range.startRow }} - {{ range.endRow }} ({{ visibleRowCount }} rows)</div>
        <div>
          <strong>Visible Cols:</strong> {{ range.startColumn }} - {{ range.endColumn }} ({{ visibleColCount }} cols)
        </div>
        <div><strong>Total Size:</strong> {{ totalWidth }}px x {{ totalHeight }}px</div>
        <div style="grid-column: 1 / -1">
          <span v-if="renderedCellCount < 500" style="color: green">
            Virtualization working! Only {{ renderedCellCount }} of
            {{ (TOTAL_ROWS * TOTAL_COLUMNS).toLocaleString() }} cells rendered
          </span>
          <span v-else style="color: orange">Many cells rendered</span>
        </div>
      </div>
    </div>
  </main>
</template>
