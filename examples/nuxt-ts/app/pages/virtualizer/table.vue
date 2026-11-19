<script setup lang="ts">
import { useTableVirtualizer } from "~/composables/useVirtualizer"

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

const getColumnSize = (index: number) => columns[index]!.width
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const cellStyle = {
  padding: "8px 12px",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
} as const

const loadedCount = ref(PAGE_SIZE)
const active = ref({ row: 0, column: 1 })
const hasMore = computed(() => loadedCount.value < TOTAL_ROWS)
const rows = computed(() => allRows.slice(0, loadedCount.value))

const onEndReached = async () => {
  await wait(400)
  loadedCount.value = Math.min(loadedCount.value + PAGE_SIZE, TOTAL_ROWS)
}

const { virtualizer, init, getRootProps } = useTableVirtualizer(() => ({
  count: rows.value.length,
  estimatedItemSize: 37,
  footerSize: hasMore.value ? 40 : 0,
  columnCount: columns.length,
  columnSize: getColumnSize,
  pinnedColumns: { start: 1 },
  retainedIndexes: [active.value.row],
  onEndReached: hasMore.value ? onEndReached : undefined,
  endReachedThreshold: 20,
}))

const measureHeaderElement = (el: unknown) => virtualizer.measureHeaderElement(el as HTMLElement | null)

const virtualColumns = computed(() => virtualizer.getVirtualColumns())
const startColumns = computed(() => virtualColumns.value.filter((column) => column.pinned === "start"))
const middleColumns = computed(() => virtualColumns.value.filter((column) => !column.pinned))

const moveActive = (row: number, column: number) => {
  const next = {
    row: Math.max(0, Math.min(rows.value.length - 1, row)),
    column: Math.max(1, Math.min(columns.length - 1, column)),
  }
  active.value = next
  virtualizer.scrollToIndex(next.row)
  virtualizer.scrollToColumn(next.column)
}

const onKeyDown = (event: KeyboardEvent) => {
  const { row, column } = active.value
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

const getBackground = (index: number) => (index === active.value.row ? "#eff6ff" : index % 2 ? "#f8fafc" : "#fff")
</script>

<template>
  <main style="padding: 20px; max-width: 960px; width: 100%; min-width: 0; box-sizing: border-box">
    <h1>Table</h1>
    <p style="color: #64748b; font-size: 14px">
      Rows and columns are windowed in a real table. The name column is pinned. Arrow keys, Page Up/Down, Home and End
      move the active cell.
    </p>

    <div
      :ref="(el) => init(el as HTMLElement)"
      v-bind="getRootProps()"
      tabindex="0"
      role="region"
      aria-label="Customers"
      :style="[
        getRootProps().style,
        {
          height: 'min(420px, calc(var(--total-size) + 2px))',
          width: '100%',
          overflow: 'auto',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          marginTop: '16px',
        },
      ]"
      @scroll="virtualizer.handleScroll"
      @keydown="onKeyDown"
    >
      <table
        :aria-rowcount="hasMore ? -1 : rows.length + 1"
        :aria-colcount="columns.length"
        :style="{ ...virtualizer.getTableStyle(), fontSize: '13px' }"
      >
        <colgroup>
          <col v-for="column in startColumns" :key="column.index" :style="virtualizer.getColumnStyle(column)" />
          <col :style="virtualizer.getColumnSpacerStyle('start')" />
          <col v-for="column in middleColumns" :key="column.index" :style="virtualizer.getColumnStyle(column)" />
          <col :style="virtualizer.getColumnSpacerStyle('end')" />
        </colgroup>
        <thead :ref="measureHeaderElement">
          <tr :aria-rowindex="1">
            <template v-for="(group, i) in [startColumns, null, middleColumns, null]" :key="i">
              <th
                v-if="group === null"
                aria-hidden="true"
                :style="virtualizer.getColumnSpacerStyle(i ? 'end' : 'start')"
              />
              <template v-else>
                <th
                  v-for="column in group"
                  :key="column.index"
                  :aria-colindex="column.index + 1"
                  :style="{
                    ...cellStyle,
                    ...virtualizer.getCellStyle(column),
                    position: 'sticky',
                    top: 0,
                    zIndex: column.pinned ? 3 : 2,
                    background: '#f8fafc',
                    textAlign: 'left',
                  }"
                >
                  {{ columns[column.index]!.label }}
                </th>
              </template>
            </template>
          </tr>
        </thead>
        <tbody aria-hidden="true">
          <tr :style="virtualizer.getRowSpacerStyle('start')" />
        </tbody>
        <tbody :style="virtualizer.getBodyStyle()">
          <tr
            v-for="item in virtualizer.getVirtualItems()"
            :key="rows[item.index]!.id"
            :ref="(el) => item.measureElement(el as HTMLElement | null)"
            :data-index="item.index"
            :aria-rowindex="item.index + 2"
            :style="{
              ...virtualizer.getRowStyle(item),
              background: getBackground(item.index),
            }"
          >
            <th
              v-for="column in startColumns"
              :key="column.index"
              scope="row"
              :aria-colindex="column.index + 1"
              :style="{
                ...cellStyle,
                ...virtualizer.getCellStyle(column),
                background: getBackground(item.index),
                textAlign: 'left',
              }"
            >
              {{ rows[item.index]!.name }}
            </th>
            <td aria-hidden="true" :style="virtualizer.getColumnSpacerStyle('start')" />
            <td
              v-for="column in middleColumns"
              :key="column.index"
              :aria-colindex="column.index + 1"
              :data-active="item.index === active.row && column.index === active.column ? '' : undefined"
              :style="{
                ...cellStyle,
                background: item.index === active.row && column.index === active.column ? '#bfdbfe' : undefined,
              }"
              @click="active = { row: item.index, column: column.index }"
            >
              {{ rows[item.index]!.values[column.index - 1] }}
            </td>
            <td aria-hidden="true" :style="virtualizer.getColumnSpacerStyle('end')" />
          </tr>
        </tbody>
        <tbody aria-hidden="true">
          <tr :style="virtualizer.getRowSpacerStyle('end')" />
        </tbody>
        <tbody v-if="hasMore">
          <tr style="height: 40px">
            <td :colspan="virtualColumns.length + 2" style="padding: 0 12px; color: #64748b">Loading more…</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #64748b">
      Loaded {{ rows.length }} of {{ TOTAL_ROWS }} rows · Rendered {{ virtualizer.getVirtualItems().length }} rows ×
      {{ virtualColumns.length }} columns · Active {{ active.row + 1 }}:{{ columns[active.column]!.label }}
    </p>
  </main>
</template>
