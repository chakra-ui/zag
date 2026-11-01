<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

const estimateSize = () => 32

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

const { virtualizer, init } = useListVirtualizer(() => ({
  count: selectData.length,
  estimatedSize: estimateSize,
  observeScrollElementSize: true,
}))

const service = useMachine(select.machine, {
  id: useId(),
  collection,
  scrollToIndexFn(details) {
    virtualizer.scrollToIndex(details.index, { align: "center" })
  },
})

const api = computed(() => select.connect(service, normalizeProps))

const rows = computed(() =>
  virtualizer.getVirtualItems().flatMap((virtualItem) => {
    const item = selectData[virtualItem.index]
    return item ? [{ virtualItem, item }] : []
  }),
)
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <label v-bind="api.getLabelProps()">Label</label>
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select a country" }}</span>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getListProps()" :ref="(el) => init(el as HTMLElement)" @scroll="virtualizer.handleScroll">
              <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
                <div
                  v-for="{ virtualItem, item } in rows"
                  :key="item.value"
                  v-bind="api.getItemProps({ item })"
                  :style="virtualizer.getItemStyle(virtualItem)"
                >
                  <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                  <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>
