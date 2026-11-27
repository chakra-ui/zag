<script setup lang="ts">
import { mergeProps } from "@zag-js/vue"
import { useGridVirtualizer } from "~/composables/useVirtualizer"

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

const rows = ref(createRows(0, 1000))
const headerEl = ref<HTMLElement | null>(null)

const { virtualizer, ref: rootRef } = useGridVirtualizer(() => ({
  rowCount: rows.value.length,
  columnCount: COLUMNS,
  // heights come from the data, so a sort changes which height each row index has
  estimatedRowSize: (index: number) => rows.value[index].height,
  estimatedColumnSize: () => 100,
  indexToKey: (index: number) => rows.value[index].id,
  overscan: 3,
}))

// column widths come from the header cells, measured once
onMounted(() => {
  headerEl.value?.querySelectorAll<HTMLElement>("[data-header]").forEach((cell, column) => {
    virtualizer.value.measureColumn(column, cell.offsetWidth)
  })
})

const sortBy = (compare: (a: Row, b: Row) => number) => (rows.value = [...rows.value].sort(compare))
const loadMore = () => (rows.value = [...rows.value, ...createRows(rows.value.length, 200)])
const syncHeader = (event: Event) => {
  if (headerEl.value) headerEl.value.scrollLeft = (event.currentTarget as HTMLElement).scrollLeft
}
const headerLabel = (column: number) => (column === 0 ? "Row" : column === 1 ? "Height" : `Column ${column + 1}`)
const cellText = (row: Row, column: number) =>
  column === 0 ? `#${row.id}` : column === 1 ? `${row.height}px` : `${row.id}.${column}`
const totals = computed(() => ({
  totalHeight: virtualizer.value.getTotalHeight(),
  trueHeight: rows.value.reduce((sum, row) => sum + row.height, 0),
  totalWidth: virtualizer.value.getTotalWidth(),
  trueWidth: headerWidths.reduce((sum, width) => sum + width, 0),
}))
</script>

<template>
  <main style="padding: 20px">
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button @click="sortBy((a, b) => a.height - b.height || a.id - b.id)">Sort by height</button>
      <button @click="sortBy((a, b) => a.id - b.id)">Sort by id</button>
      <button @click="loadMore">Load more</button>
    </div>
    <div style="width: 600px; margin-top: 12px; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden">
      <!-- scrolled sideways with the grid -->
      <div ref="headerEl" style="overflow: hidden; background: #f3f4f6; border-bottom: 1px solid #d1d5db">
        <!-- the padding stands in for the grid's vertical scrollbar, so both scroll the same distance -->
        <div style="display: flex; width: max-content; padding-right: 24px">
          <div
            v-for="(width, column) in headerWidths"
            :key="column"
            data-header
            :style="{
              width: `${width}px`,
              flexShrink: 0,
              padding: '8px',
              boxSizing: 'border-box',
              fontSize: '12px',
              fontWeight: 600,
            }"
          >
            {{ headerLabel(column) }}
          </div>
        </div>
      </div>
      <div
        :ref="rootRef"
        v-bind="mergeProps(virtualizer.getRootProps(), { style: { height: '400px' }, onScroll: syncHeader })"
        aria-label="Rows"
      >
        <div v-bind="virtualizer.getContentProps()">
          <div
            v-for="virtualRow in virtualizer.getVirtualRows()"
            :key="rows[virtualRow.row].id"
            v-bind="virtualizer.getRowProps(virtualRow)"
            data-testid="row"
            :data-height="rows[virtualRow.row].height"
          >
            <div
              v-for="column in virtualRow.columns"
              :key="column.column"
              v-bind="
                mergeProps(virtualizer.getCellProps(virtualRow, column), {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    boxSizing: 'border-box',
                    borderBottom: '1px solid #e5e7eb',
                    borderRight: '1px solid #f3f4f6',
                    background: virtualRow.row % 2 ? '#fafafa' : '#fff',
                    fontSize: '12px',
                    fontWeight: column.column === 0 ? 600 : 400,
                  },
                })
              "
            >
              {{ cellText(rows[virtualRow.row], column.column) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <p style="margin: 12px 0 4px; font-size: 13px; color: #6b7280">
      Row heights come from the data; column widths are measured from the header once.
    </p>
    <pre>{{ JSON.stringify(totals) }}</pre>
  </main>
</template>
