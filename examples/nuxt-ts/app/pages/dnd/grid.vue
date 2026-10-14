<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
import type { CSSProperties } from "vue"
import styles from "@styles/dnd-grid.module.css"

const COLUMN_COUNT = 3

const colors = ["#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#e5e7eb", "#fde68a"]

const initialItems = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
  color: colors[i] ?? "",
}))

type GridItem = (typeof initialItems)[number]

function getInsertionIndex(
  items: GridItem[],
  dragValues: string[],
  dropTarget: string,
  dropPlacement: dnd.DropPlacement,
) {
  if (dropPlacement === "on") return null

  const dragSet = new Set(dragValues)
  const remaining = items.filter((item) => !dragSet.has(item.id))
  const targetIndex = remaining.findIndex((item) => item.id === dropTarget)
  if (targetIndex === -1) return null

  return dropPlacement === "after" ? targetIndex + 1 : targetIndex
}

function getGridSlotEl(gridEl: HTMLElement, index: number) {
  return Array.from(gridEl.querySelectorAll<HTMLElement>("[data-dnd-draggable]"))[index]
}

const items = ref(initialItems)
const placeholderStyle = ref<CSSProperties | null>(null)
const gridRef = ref<HTMLDivElement | null>(null)

const service = useMachine(dnd.machine, {
  id: useId(),
  columnCount: COLUMN_COUNT,
  onDrop(details) {
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (i) => i.id })
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
const draggedItem = computed(() =>
  api.value.dragSource ? items.value.find((item) => item.id === api.value.dragSource) : null,
)

watch(
  () => [
    api.value.isDragging,
    api.value.dropPlacement,
    api.value.dropTarget,
    api.value.dragValues.join("\0"),
    items.value,
  ],
  () => {
    const gridEl = gridRef.value
    const { isDragging, dropTarget, dropPlacement, dragValues } = api.value
    if (!gridEl || !isDragging || !dropTarget || !dropPlacement) {
      placeholderStyle.value = null
      return
    }

    const insertionIndex = getInsertionIndex(items.value, dragValues, dropTarget, dropPlacement)
    if (insertionIndex == null) {
      placeholderStyle.value = null
      return
    }

    const targetEl = getGridSlotEl(gridEl, insertionIndex)
    if (!targetEl) return

    const gridRect = gridEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    placeholderStyle.value = {
      top: `${targetRect.top - gridRect.top}px`,
      left: `${targetRect.left - gridRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
    }
  },
  { flush: "post" },
)
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Grid Layout ({{ COLUMN_COUNT }} columns)</h3>
      <div ref="gridRef" :class="styles.grid">
        <div v-for="item in items" :key="item.id" :class="styles.item">
          <div
            v-bind="
              mergeProps(api.getDraggableProps({ value: item.id }), api.getDropTargetProps({ value: item.id }), {
                class: styles.draggable,
              })
            "
            :style="{ '--item-color': item.color }"
          >
            <span v-bind="api.getDragHandleProps({ value: item.id })" :class="styles.dragHandle">
              <GripVertical :size="14" />
            </span>
            {{ item.label }}
          </div>
        </div>
        <div v-if="placeholderStyle" :class="styles.placeholder" :style="placeholderStyle" />
      </div>

      <div
        v-if="api.isDragging && draggedItem"
        v-bind="api.getDragPreviewProps()"
        :class="styles.dragPreview"
        :style="{ '--item-color': draggedItem.color }"
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
