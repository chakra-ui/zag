<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import styles from "@styles/dnd-list.module.css"

const estimateSize = () => 40

const initialItems = Array.from({ length: 500 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

const items = ref(initialItems)

const { virtualizer, init } = useListVirtualizer(() => ({
  count: items.value.length,
  estimatedSize: estimateSize,
  overscan: 10,
}))

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  scrollThreshold: 30,
  onDrop(details) {
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (i) => i.id })
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))

const rows = computed(() =>
  virtualizer.getVirtualItems().flatMap((vi) => {
    const item = items.value[vi.index]
    return item ? [{ vi, item }] : []
  }),
)
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Virtualized (500 items)</h3>
      <div :ref="(el) => init(el as HTMLElement)" :class="styles.virtualViewport" @scroll="virtualizer.handleScroll">
        <div :class="styles.virtualSizer" :style="{ height: `${virtualizer.getTotalSize()}px` }">
          <div v-for="{ vi, item } in rows" :key="item.id" :style="virtualizer.getItemStyle(vi)">
            <div :class="styles.virtualRowInner">
              <div
                v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'before' })"
                :class="styles.dropIndicator"
              />
              <div
                v-bind="
                  mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
                    class: `${styles.draggable} ${styles.dropTarget}`,
                  })
                "
              >
                <span v-bind="api.getDragHandleProps({ value: item.id })" :class="styles.dragHandle">
                  <GripVertical :size="14" />
                </span>
                {{ item.label }}
              </div>
              <div
                v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'after' })"
                :class="styles.dropIndicator"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
