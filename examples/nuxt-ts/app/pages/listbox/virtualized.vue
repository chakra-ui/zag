<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const estimateSize = () => 28

const items: Item[] = new Array(10000).fill(0).map((_, index) => ({
  label: `Item ${index}`,
  value: `item-${index}`,
}))

const collection = listbox.collection({ items })

const { virtualizer, init } = useListVirtualizer({
  count: items.length,
  estimatedSize: estimateSize,
  overscan: 12,
})

const service = useMachine(listbox.machine as listbox.Machine<Item>, {
  collection,
  id: useId(),
  scrollToIndexFn(details) {
    virtualizer.scrollToIndex(details.index, { align: "auto" })
  },
})

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()" :ref="(el) => init(el as HTMLElement)" @scroll="virtualizer.handleScroll">
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
            <div
              v-for="vi in virtualizer.getVirtualItems()"
              :key="items[vi.index]!.value"
              v-bind="api.getItemProps({ item: items[vi.index]! })"
              :data-index="vi.index"
              :aria-setsize="items.length"
              :aria-posinset="vi.index + 1"
              :style="{ ...virtualizer.getItemStyle(vi), overflowAnchor: 'none' }"
            >
              <span v-bind="api.getItemTextProps({ item: items[vi.index]! })">{{ items[vi.index]!.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item: items[vi.index]! })">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
