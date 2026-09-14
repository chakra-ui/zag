<script setup lang="ts">
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
const value = ref("react")
const collection = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid"].map((label) => ({ label, value: label.toLowerCase() })),
})
const service = useMachine(wheelPicker.machine, {
  id: useId(),
  collection,
  get value() {
    return value.value
  },
  onValueChange: (details) => (value.value = details.value ?? "react"),
})
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
    </div>
    <div class="wheel-picker-actions">
      <button @click="value = 'react'">Select React</button><button @click="value = 'svelte'">Select Svelte</button>
    </div>
    <output>Controlled value: {{ api.valueAsString }}</output>
  </main>
  <Toolbar><StateVisualizer :state="service" /></Toolbar>
</template>
