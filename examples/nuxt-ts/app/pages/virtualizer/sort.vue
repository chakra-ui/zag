<script setup lang="ts">
import { mergeProps } from "@zag-js/vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"

interface Row {
  id: number
  height: number
}

// heights come from the data, so the list's true size is known
const rows: Row[] = Array.from({ length: 2000 }, (_, id) => ({ id, height: 30 + ((id * 37) % 7) * 20 }))

const items = ref(rows)
const target = ref(1000)

const { virtualizer, ref: rootRef } = useListVirtualizer(() => ({
  count: items.value.length,
  estimatedItemSize: 48,
  overscan: 4,
  indexToKey: (index: number) => items.value[index].id,
}))

const sortBy = (compare: (a: Row, b: Row) => number) => (items.value = [...items.value].sort(compare))
const trueSize = computed(() => items.value.reduce((sum, row) => sum + row.height, 0))
</script>

<template>
  <main style="padding: 20px">
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button @click="sortBy((a, b) => a.height - b.height || a.id - b.id)">Sort by height</button>
      <button @click="sortBy((a, b) => a.id - b.id)">Sort by id</button>
      <button @click="items = [...items].reverse()">Reverse</button>
      <label style="display: flex; align-items: center; gap: 6px">
        Row
        <input v-model.number="target" type="number" :min="0" :max="items.length - 1" style="width: 80px" />
      </label>
      <button @click="virtualizer.scrollToIndex(target, { align: 'start' })">Scroll to row</button>
    </div>
    <div
      :ref="rootRef"
      v-bind="
        mergeProps(virtualizer.getRootProps(), {
          style: { height: '400px', width: '360px', border: '1px solid #ccc', marginTop: '12px' },
        })
      "
      aria-label="Rows"
    >
      <div v-bind="virtualizer.getContentProps()">
        <div
          v-for="item in virtualizer.getVirtualItems()"
          :key="item.key"
          v-bind="virtualizer.getItemProps(item)"
          data-testid="row"
        >
          <div
            :style="{
              height: `${items[item.index].height}px`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              borderBottom: '1px solid #e5e7eb',
              background: `hsl(${200 + items[item.index].height}, 70%, 97%)`,
              boxSizing: 'border-box',
              fontSize: '13px',
            }"
          >
            <strong>#{{ items[item.index].id }}</strong>
            <span style="color: #6b7280">{{ items[item.index].height }}px tall</span>
          </div>
        </div>
      </div>
    </div>
    <p style="margin: 12px 0 4px; font-size: 13px; color: #6b7280">
      The virtualizer's size against the true size. Rows not yet measured use the estimate.
    </p>
    <pre>{{ JSON.stringify({ totalSize: virtualizer.getTotalSize(), trueSize }) }}</pre>
  </main>
</template>
