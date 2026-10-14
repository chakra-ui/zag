<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
import styles from "@styles/dnd-list.module.css"

const initialItems = [
  { id: "1", label: "Apple", emoji: "🍎" },
  { id: "2", label: "Banana", emoji: "🍌" },
  { id: "3", label: "Cherry", emoji: "🍒" },
  { id: "4", label: "Date", emoji: "🌴" },
  { id: "5", label: "Elderberry", emoji: "🫐" },
]

const items = ref(initialItems)
const itemMap = computed(() => new Map(items.value.map((i) => [i.id, i])))

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  onDrop(details) {
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (i) => i.id })
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
const draggedItem = computed(() => (api.value.dragSource ? itemMap.value.get(api.value.dragSource) : null))
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Drag Overlay</h3>
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
            <span>{{ item.emoji }}</span>
            {{ item.label }}
          </div>
          <div
            v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'after' })"
            :class="styles.dropIndicator"
          />
        </li>
      </ul>

      <div v-if="api.isDragging && draggedItem" v-bind="api.getDragPreviewProps()" :class="styles.dragPreview">
        {{ draggedItem.emoji }} {{ draggedItem.label }}
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
