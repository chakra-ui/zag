<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
]

const items = ref(initialItems)

const service = useMachine(
  dnd.machine,
  {
    id: useId(),
    orientation: "vertical",
    onDrop(details) {
      const { source, target, placement } = details
      if (placement === "on") return
      const fromIndex = items.value.findIndex((item) => item.id === source)
      const toIndex = items.value.findIndex((item) => item.id === target)
      if (fromIndex === -1 || toIndex === -1) return
      items.value = dnd.move(items.value, fromIndex, dnd.getDestinationIndex(items.value.length, fromIndex, toIndex, placement))
    },
  },
)

const api = computed(() => dnd.connect(service, normalizeProps))
</script>

<template>
  <main class="dnd">
    <div v-bind="api.getRootProps()">
      <h3>Sortable List</h3>
      <ul style="list-style: none; padding: 0">
        <li v-for="item in items" :key="item.id" style="position: relative">
          <div v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'before' })" />
          <div
            v-bind="mergeProps(
              api.getDraggableProps({ value: item.id }),
              api.getDropTargetProps({ value: item.id }),
            )"
          >
            <span v-bind="api.getDragHandleProps({ value: item.id })">
              <GripVertical :size="14" />
            </span>
            {{ item.label }}
          </div>
          <div v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'after' })" />
        </li>
      </ul>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
