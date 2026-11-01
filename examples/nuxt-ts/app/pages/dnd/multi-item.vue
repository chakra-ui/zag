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
  { id: "6", label: "Fig" },
]

const items = ref(initialItems)
const selectedIds = ref<string[]>([])
const itemMap = computed(() => new Map(items.value.map((i) => [i.id, i])))

const toggleSelect = (id: string) => {
  const prev = selectedIds.value
  selectedIds.value = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
}

const id = useId()
const service = useMachine(
  dnd.machine,
  computed<dnd.Props>(() => ({
    id,
    orientation: "vertical",
    selectedValues: selectedIds.value,
    getValueText: (value) => itemMap.value.get(value)?.label ?? value,
    onDrop(details) {
      items.value = dnd.reorder(items.value, { ...details, source: details.values, itemToValue: (i) => i.id })
      selectedIds.value = []
    },
  })),
)

const api = computed(() => dnd.connect(service, normalizeProps))
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Multi-Item Drag</h3>
      <p :class="styles.helperText">
        Click items to select, then drag any selected item.
        <strong v-if="selectedIds.length > 0"> ({{ selectedIds.length }} selected)</strong>
      </p>
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
            :data-selected="selectedIds.includes(item.id) ? '' : undefined"
            @click="toggleSelect(item.id)"
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

      <div
        v-if="api.isDragging && api.dragValues.length > 1"
        v-bind="api.getDragPreviewProps()"
        :class="styles.dragPreview"
      >
        {{ api.dragValues.length }} items
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
