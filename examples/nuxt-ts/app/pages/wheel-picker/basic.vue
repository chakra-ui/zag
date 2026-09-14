<script setup lang="ts">
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
const collection = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid", "Preact"].map((label) => ({
    label,
    value: label.toLowerCase(),
  })),
})
const service = useMachine(wheelPicker.machine, { id: useId(), collection, defaultValue: "react", name: "framework" })
const api = computed(() => wheelPicker.connect(service, normalizeProps))
</script>
<template>
  <main class="wheel-picker">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Framework</label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getViewportProps()">
          <ul v-bind="api.getItemGroupProps()">
            <li v-for="{ item, index, key } in api.items" :key="key" v-bind="api.getItemProps({ item, index })">
              {{ item.label }}
            </li>
          </ul>
          <div v-bind="api.getHighlightProps()">
            <ul v-bind="api.getHighlightItemGroupProps()">
              <li
                v-for="{ item, index, key } in api.highlightItems"
                :key="key"
                v-bind="api.getHighlightItemProps({ item, index })"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <select v-bind="api.getHiddenSelectProps()">
        <option v-for="item in collection.items" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
    </div>
    <output data-testid="value">Selected: {{ api.valueAsString }}</output>
  </main>
  <Toolbar><StateVisualizer :state="service" /></Toolbar>
</template>
