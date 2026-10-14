<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

// Controller ignores selection changes; value is always ["react"]
const value = ["react"]

const collection = combobox.collection({
  items,
  itemToValue: (item) => item.value,
  itemToString: (item) => item.label,
})

const service = useMachine(combobox.machine as combobox.Machine<Item>, {
  id: useId(),
  collection,
  value,
  multiple: true,
  openOnClick: true,
  // No onValueChange on purpose
})

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
      <div style="font-size: 0.875rem"><strong>Value (controlled, fixed):</strong> {{ value.join(", ") }}</div>
      <div data-testid="selected-items" style="font-size: 0.875rem">
        <strong>Selected items (from api):</strong>
        {{ api.selectedItems.map((item) => (typeof item === "string" ? item : item.label)).join(", ") }}
      </div>
      <div style="font-size: 0.75rem; color: #666">
        Expected: both should show &quot;React&quot;. Bug: selectedItems may show &quot;React, Vue&quot; after selecting
        Vue.
      </div>

      <div>
        <label v-bind="api.getLabelProps()">Select framework</label>
        <div v-bind="api.getControlProps()" style="display: flex; margin-top: 4px">
          <input
            data-testid="input"
            v-bind="api.getInputProps()"
            style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px"
          />
          <button data-testid="trigger" v-bind="api.getTriggerProps()" style="padding: 8px">▼</button>
        </div>
      </div>

      <div v-bind="api.getPositionerProps()">
        <div
          data-testid="combobox-content"
          v-bind="api.getContentProps()"
          style="
            list-style: none;
            margin: 0;
            padding: 4px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-top: 4px;
            max-height: 200px;
            overflow: auto;
          "
        >
          <div v-bind="api.getListProps()">
            <div
              v-for="item in items"
              :key="item.value"
              :data-testid="item.value"
              v-bind="api.getItemProps({ item })"
              style="padding: 8px 12px; cursor: pointer"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
