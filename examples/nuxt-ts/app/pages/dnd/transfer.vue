<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
import styles from "@styles/dnd-list.module.css"

interface Item {
  id: string
  label: string
}

const fruitsData: Item[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
  { id: "date", label: "Date" },
]

const veggiesData: Item[] = [
  { id: "asparagus", label: "Asparagus" },
  { id: "broccoli", label: "Broccoli" },
  { id: "carrot", label: "Carrot" },
]

function insertAt<T extends { id: string }>(items: T[], targetId: string, placement: string, item: T): T[] {
  const idx = items.findIndex((i) => i.id === targetId)
  if (idx === -1) return [...items, item]
  const insertIdx = placement === "after" ? idx + 1 : idx
  return [...items.slice(0, insertIdx), item, ...items.slice(insertIdx)]
}

function reorderWithin(items: Item[], source: string, target: string, placement: "before" | "after") {
  const fromIndex = items.findIndex((i) => i.id === source)
  const toIndex = items.findIndex((i) => i.id === target)
  return dnd.move(items, fromIndex, dnd.getDestinationIndex(items.length, fromIndex, toIndex, placement))
}

const fruits = ref(fruitsData)
const veggies = ref(veggiesData)

const itemMap = computed(() => {
  const map = new Map<string, Item>()
  for (const i of fruits.value) map.set(i.id, i)
  for (const i of veggies.value) map.set(i.id, i)
  return map
})

const fruitIds = computed(() => new Set(fruits.value.map((i) => i.id)))

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  getValueText: (value) => itemMap.value.get(value)?.label ?? value,
  onDrop({ source, target, placement }) {
    if (placement === "on") return

    const sourceItem = itemMap.value.get(source)
    if (!sourceItem) return

    const fromFruits = fruitIds.value.has(source)
    const toFruits = fruitIds.value.has(target)

    if (fromFruits && toFruits) {
      fruits.value = reorderWithin(fruits.value, source, target, placement)
    } else if (!fromFruits && !toFruits) {
      veggies.value = reorderWithin(veggies.value, source, target, placement)
    } else if (fromFruits && !toFruits) {
      fruits.value = fruits.value.filter((i) => i.id !== source)
      veggies.value = insertAt(veggies.value, target, placement, sourceItem)
    } else {
      veggies.value = veggies.value.filter((i) => i.id !== source)
      fruits.value = insertAt(fruits.value, target, placement, sourceItem)
    }
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))

const columns = computed(() => [
  { key: "fruits", title: "Fruits", items: fruits.value },
  { key: "veggies", title: "Veggies", items: veggies.value },
])
</script>

<template>
  <main :class="styles.main">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Multi-Container Transfer</h3>
      <div :class="styles.transferLayout">
        <div v-for="column in columns" :key="column.key" :class="styles.transferColumn">
          <h4>{{ column.title }} ({{ column.items.length }})</h4>
          <ul :class="styles.transferList">
            <li v-for="item in column.items" :key="item.id" :class="styles.item">
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
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
