<script lang="ts" setup>
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { GripVertical } from "lucide-vue-next"
import styles from "@styles/dnd-variable-size.module.css"

const initialItems = [
  {
    id: "scope",
    title: "Define scope",
    description: "Short item.",
  },
  {
    id: "audit",
    title: "Audit current behavior",
    description:
      "Review pointer collision, keyboard movement, auto-scroll, and drag preview behavior across list and grid examples.",
  },
  {
    id: "prototype",
    title: "Prototype changes",
    description:
      "Build a small example that intentionally mixes compact rows with taller rows so before and after placement can be checked near uneven item boundaries.",
  },
  {
    id: "docs",
    title: "Update notes",
    description: "Capture the recommendation and remaining risks.",
  },
  {
    id: "qa",
    title: "Run checks",
    description:
      "Validate with pointer dragging from the top, middle, and bottom of each row. Include slow diagonal movement across item gaps.",
  },
  {
    id: "ship",
    title: "Ship",
    description: "Prepare the final patch once the behavior is predictable.",
  },
]

const items = ref(initialItems)

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  onDrop(details) {
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (item) => item.id })
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
const draggedItem = computed(() => items.value.find((item) => item.id === api.value.dragSource))
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Variable Size List</h3>
      <ul :class="styles.items">
        <li v-for="item in items" :key="item.id" :class="styles.item">
          <div
            v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'before' })"
            :class="styles.dropIndicator"
          />
          <div
            v-bind="
              mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
                class: styles.draggable,
              })
            "
          >
            <span v-bind="api.getDragHandleProps({ value: item.id })" :class="styles.dragHandle">
              <GripVertical :size="14" />
            </span>
            <span :class="styles.content">
              <span :class="styles.title">{{ item.title }}</span>
              <span :class="styles.description">{{ item.description }}</span>
            </span>
          </div>
          <div
            v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'after' })"
            :class="styles.dropIndicator"
          />
        </li>
      </ul>

      <div
        v-if="api.isDragging && draggedItem"
        v-bind="api.getDragPreviewProps()"
        :class="[styles.draggable, styles.dragPreview]"
      >
        <span :class="styles.dragHandle">
          <GripVertical :size="14" />
        </span>
        <span :class="styles.content">
          <span :class="styles.title">{{ draggedItem.title }}</span>
          <span :class="styles.description">{{ draggedItem.description }}</span>
        </span>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
