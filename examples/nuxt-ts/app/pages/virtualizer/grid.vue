<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { useGridVirtualizer } from "~/composables/useVirtualizer"

const ROW_COUNT = 1_000
const COLUMN_COUNT = 50
const CELL_HEIGHT = 40
const CELL_WIDTH = 120

const { virtualizer, version, init } = useGridVirtualizer({
  rowCount: ROW_COUNT,
  columnCount: COLUMN_COUNT,
  estimatedRowSize: () => CELL_HEIGHT,
  estimatedColumnSize: () => CELL_WIDTH,
  overscan: 3,
  observeScrollElementSize: true,
})

const setScrollRef = (element: Element | ComponentPublicInstance | null) => {
  init(element as HTMLElement | null)
}

const virtualRows = computed(() => {
  version.value
  return virtualizer.getVirtualRows()
})

const totalHeight = computed(() => {
  version.value
  return virtualizer.getTotalHeight()
})

const totalWidth = computed(() => {
  version.value
  return virtualizer.getTotalWidth()
})

const getCellValue = (row: number, column: number) => `R${row + 1}C${column + 1}`
</script>

<template>
  <main style="padding: 20px; width: 100%; max-width: 960px">
    <h1>Grid Virtualizer</h1>
    <p style="color: #64748b">Virtualizing {{ ROW_COUNT.toLocaleString() }} rows x {{ COLUMN_COUNT }} columns.</p>

    <div
      :ref="setScrollRef"
      tabindex="0"
      aria-label="Virtualized grid"
      @scroll="virtualizer.handleScroll"
      :style="{ ...virtualizer.getContainerStyle(), width: '100%', height: '520px', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '16px' }"
    >
      <div :style="{ height: `${totalHeight}px`, width: `${totalWidth}px`, position: 'relative' }">
        <div v-for="virtualRow in virtualRows" :key="virtualRow.row" :style="virtualizer.getRowStyle(virtualRow)">
          <div
            v-for="column in virtualRow.columns"
            :key="`${virtualRow.row}-${column.column}`"
            :style="{
              ...virtualizer.getCellStyleInRow(column),
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              background: (virtualRow.row + column.column) % 2 === 0 ? '#fff' : '#f8fafc',
            }"
          >
            {{ getCellValue(virtualRow.row, column.column) }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
