<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const items: Item[] = new Array(10000).fill(0).map((_, index) => ({
  label: `Item ${index}`,
  value: `item-${index}`,
}))

const collection = listbox.collection({ items })

const { virtualizer, ref: rootRef } = useListVirtualizer({
  count: items.length,
  itemSize: 32,
  overscan: 12,
})

const service = useMachine(listbox.machine as listbox.Machine<Item>, {
  collection,
  id: useId(),
  scrollToIndexFn(details) {
    virtualizer.value.scrollToIndex(details.index, { align: "auto" })
  },
})

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getContentProps()">
        <div v-bind="mergeProps(virtualizer.getRootProps(), api.getListProps())" :ref="rootRef">
          <div v-bind="virtualizer.getContentProps()">
            <div
              v-for="vi in virtualizer.getVirtualItems()"
              :key="items[vi.index]!.value"
              v-bind="mergeProps(virtualizer.getItemProps(vi), api.getItemProps({ item: items[vi.index]! }))"
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
