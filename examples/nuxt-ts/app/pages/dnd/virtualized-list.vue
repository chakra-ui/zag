<script lang="ts" setup>
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { GripVertical } from "lucide-vue-next"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import styles from "@styles/dnd-virtualized-list.module.css"

const initialItems = Array.from({ length: 500 }, (_, index) => ({
  id: String(index + 1),
  label: `Item ${index + 1}`,
}))

const items = ref(initialItems)
const lastDrop = ref<string | null>(null)
const viewportEl = ref<HTMLElement | null>(null)

const { virtualizer, ref: rootRef } = useListVirtualizer(() => ({
  count: items.value.length,
  itemSize: 44,
  overscan: 8,
  aria: false,
}))

const setViewportRef = (el: HTMLElement | null) => {
  viewportEl.value = el
  rootRef(el)
}

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  scrollThreshold: 36,
  onDrop(details) {
    lastDrop.value = `${details.source} -> ${details.target} ${details.placement}`
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (item) => item.id })
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
const range = computed(() => virtualizer.value.getRange())
const draggedItem = computed(() => items.value.find((item) => item.id === api.value.dragSource))

const rows = computed(() =>
  virtualizer.value.getVirtualItems().flatMap((virtualItem) => {
    const item = items.value[virtualItem.index]
    return item ? [{ virtualItem, item }] : []
  }),
)
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Virtualized List</h3>

      <div :class="styles.toolbar">
        <span :class="styles.stat">mounted {{ range.startIndex + 1 }}-{{ range.endIndex + 1 }}</span>
        <span :class="styles.stat">scroll {{ Math.round(viewportEl?.scrollTop ?? 0) }}</span>
        <span :class="styles.stat">over {{ api.dropTarget ? `${api.dropTarget} ${api.dropPlacement}` : "none" }}</span>
        <span :class="styles.stat">drop {{ lastDrop ?? "none" }}</span>
      </div>

      <div
        :ref="(el) => setViewportRef(el as HTMLElement | null)"
        v-bind="virtualizer.getRootProps()"
        :class="styles.viewport"
      >
        <div v-bind="virtualizer.getContentProps()" :class="styles.sizer">
          <div v-for="{ virtualItem, item } in rows" :key="item.id" v-bind="virtualizer.getItemProps(virtualItem)">
            <div :class="styles.row">
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

      <div
        v-if="api.isDragging && draggedItem"
        v-bind="api.getDragPreviewProps()"
        :class="[styles.draggable, styles.dragPreview]"
      >
        <span :class="styles.dragHandle">
          <GripVertical :size="14" />
        </span>
        {{ draggedItem.label }}
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
