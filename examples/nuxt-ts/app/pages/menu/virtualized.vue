<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const items = Array.from({ length: 1000 }, (_, index) => ({ value: `item-${index}`, label: `Item ${index}` }))

const collection = menu.collection({ items })

// Pairs each rendered row with its item, so the template needs no index lookups
const getRows = () =>
  virtualizer.getVirtualItems().flatMap((virtualItem) => {
    const item = items[virtualItem.index]
    return item ? [{ virtualItem, item }] : []
  })

const estimateSize = () => 32

const selected = ref("-")

const { virtualizer, init } = useListVirtualizer(() => ({
  count: items.length,
  estimatedSize: estimateSize,
  observeScrollElementSize: true,
}))

const service = useMachine(menu.machine, {
  id: useId(),
  collection,
  scrollToIndexFn(details) {
    virtualizer.scrollToIndex(details.index)
  },
  onSelect: ({ value }) => {
    selected.value = value
  },
})

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Pick an item <span v-bind="api.getIndicatorProps()">▾</span></button>
    <p>
      Selected: <output aria-label="Selected item">{{ selected }}</output>
    </p>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div
          v-bind="api.getContentProps()"
          :ref="(el) => init(el as HTMLElement)"
          @scroll="virtualizer.handleScroll"
          style="max-height: 320px; overflow-y: auto"
        >
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }">
            <div
              v-for="{ virtualItem, item } in getRows()"
              :key="item.value"
              v-bind="api.getItemProps({ value: item.value })"
              :style="virtualizer.getItemStyle(virtualItem)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>
