<script setup lang="ts">
import * as dnd from "@zag-js/dnd"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tabs.css"
import "@styles/tabs-reorder.css"

const hint = "Drag a tab to reorder, or press Alt + Left or Right."

const items = ref(tabsData)

const tabsService = useMachine(tabs.machine, {
  id: useId(),
  defaultValue: "nils",
})

const dndService = useMachine(dnd.machine, {
  id: useId(),
  orientation: "horizontal",
  activationConstraint: { distance: 4 },
  // Enter and Space select tabs, so reorder with Alt + arrow instead
  isActivationKey: () => false,
  translations: { instructions: hint, roleDescription: null },
  onDrop(details) {
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (item) => item.id })
  },
})

const tabsApi = computed(() => tabs.connect(tabsService, normalizeProps))
const dndApi = computed(() => dnd.connect(dndService, normalizeProps))

function onTriggerKeyDown(event: KeyboardEvent, value: string) {
  if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return
  event.preventDefault()
  dndApi.value.move({ value, to: event.key === "ArrowLeft" ? "prev" : "next" })
}
</script>

<template>
  <main class="tabs">
    <div v-bind="tabsApi.getRootProps()">
      <div v-bind="tabsApi.getIndicatorProps()" />
      <div v-bind="mergeProps(dndApi.getRootProps(), tabsApi.getListProps())">
        <button
          v-for="item in items"
          :key="item.id"
          v-bind="
            mergeProps(
              dndApi.getDraggableProps({ value: item.id }),
              dndApi.getDropTargetProps({ value: item.id }),
              tabsApi.getTriggerProps({ value: item.id }),
              {
                onKeydown: (event: KeyboardEvent) => onTriggerKeyDown(event, item.id),
              },
            )
          "
        >
          <span v-bind="dndApi.getDropIndicatorProps({ value: item.id, placement: 'before' })" />
          {{ item.label }}
          <span v-bind="dndApi.getDropIndicatorProps({ value: item.id, placement: 'after' })" />
        </button>
      </div>
      <div v-for="item in items" :key="item.id" v-bind="tabsApi.getContentProps({ value: item.id })">
        <p>{{ item.content }}</p>
      </div>
    </div>
    <p class="tabs-reorder-hint">{{ hint }}</p>
  </main>

  <Toolbar>
    <StateVisualizer :state="tabsService" label="tabs" />
    <StateVisualizer :state="dndService" label="dnd" />
  </Toolbar>
</template>
