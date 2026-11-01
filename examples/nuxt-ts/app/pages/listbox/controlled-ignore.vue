<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

const value = ["react"]

const collection = listbox.collection({
  items,
  itemToValue: (item) => item.value,
  itemToString: (item) => item.label,
})

const service = useMachine(listbox.machine as listbox.Machine<Item>, {
  id: useId(),
  collection,
  value,
  selectionMode: "multiple",
})

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
      <div style="font-size: 0.875rem"><strong>Value (controlled, fixed):</strong> {{ value.join(", ") }}</div>
      <div data-testid="selected-items" style="font-size: 0.875rem">
        <strong>Selected items (from api):</strong> {{ api.selectedItems.map((item) => item.label).join(", ") }}
      </div>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select framework</label>
        <div data-testid="listbox-content" v-bind="api.getContentProps()">
          <ul v-bind="api.getListProps()">
            <li v-for="item in items" :key="item.value" :data-testid="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>
