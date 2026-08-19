<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
import styles from "@styles/dnd-list.module.css"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
]

const items = ref(initialItems)

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  onDrop(details) {
    const { source, target, placement } = details
    if (placement === "on") return
    const fromIndex = items.value.findIndex((item) => item.id === source)
    const toIndex = items.value.findIndex((item) => item.id === target)
    if (fromIndex === -1 || toIndex === -1) return
    items.value = dnd.move(
      items.value,
      fromIndex,
      dnd.getDestinationIndex(items.value.length, fromIndex, toIndex, placement),
    )
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Sortable List</h3>
      <ul :class="styles.items">
        <li v-for="item in items" :key="item.id" :class="styles.item">
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
        </li>
      </ul>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
