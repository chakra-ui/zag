<script setup lang="ts">
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/vue"
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

const estimateSize = () => ROW_HEIGHT

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

const { virtualizer, init } = useListVirtualizer({
  count: items.length,
  estimatedSize: estimateSize,
  overscan: 8,
})

const service = useMachine(gridlist.machine as gridlist.Machine<Row>, {
  id: useId(),
  collection,
  selectionMode: "multiple",
  scrollToIndexFn(details) {
    virtualizer.scrollToIndex(details.index, { align: "auto" })
  },
})

const api = computed(() => gridlist.connect(service, normalizeProps))
const virtualItems = computed(() => virtualizer.getVirtualItems())
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">10,000 rows</label>
        <div
          :ref="(el) => init(el as HTMLElement)"
          v-bind="api.getContentProps()"
          tabindex="0"
          style="height: 360px; width: 480px"
          @scroll="virtualizer.handleScroll"
        >
          <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
            <div
              v-for="vi in virtualItems"
              :key="items[vi.index]!.id"
              v-bind="api.getItemProps({ item: items[vi.index]! })"
              :data-index="vi.index"
              :style="{ ...virtualizer.getItemStyle(vi), overflowAnchor: 'none' }"
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
