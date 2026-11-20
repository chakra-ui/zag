<script setup lang="ts">
import * as gridlist from "@zag-js/gridlist"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon } from "lucide-vue-next"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import "@styles/gridlist.css"

interface Row {
  id: string
  index: number
  name: string
}

const ROW_HEIGHT = 44
const ROW_COUNT = 10000

const items: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: `row-${i}`,
  index: i,
  name: `Row ${i + 1}`,
}))

const collection = gridlist.collection<Row>({
  items,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.name,
})

const { virtualizer, ref: rootRef } = useListVirtualizer({
  count: items.length,
  itemSize: ROW_HEIGHT,
  overscan: 8,
  // Grid rows take `aria-rowindex`, not list positions
  aria: false,
})

const service = useMachine(gridlist.machine as gridlist.Machine<Row>, {
  id: useId(),
  collection,
  selectionMode: "multiple",
  scrollToIndexFn(details) {
    virtualizer.value.scrollToIndex(details.index, { align: "auto" })
  },
})

const api = computed(() => gridlist.connect(service, normalizeProps))
const virtualItems = computed(() => virtualizer.value.getVirtualItems())
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">10,000 rows</label>
        <div
          :ref="rootRef"
          v-bind="mergeProps(virtualizer.getRootProps(), api.getContentProps())"
          style="height: 360px; width: 480px"
        >
          <div v-bind="virtualizer.getContentProps()">
            <div
              v-for="vi in virtualItems"
              :key="items[vi.index]!.id"
              v-bind="mergeProps(virtualizer.getItemProps(vi), api.getItemProps({ item: items[vi.index]! }))"
            >
              <div v-bind="api.getCellProps()">
                <button v-if="api.hasCheckbox" v-bind="api.getItemCheckboxProps({ item: items[vi.index]! })">
                  <CheckIcon v-bind="api.getItemIndicatorProps({ item: items[vi.index]! })" />
                </button>
                <div class="gridlist-item-body">
                  <span v-bind="api.getItemTextProps({ item: items[vi.index]! })" class="gridlist-item-title">
                    {{ items[vi.index]!.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style="margin-top: 12px; font-size: 13px; color: #52525b">
        Selected: <strong>{{ api.value.length }}</strong> · Rendered: {{ virtualItems.length }} of {{ items.length }}
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue', 'value']" />
  </Toolbar>
</template>
