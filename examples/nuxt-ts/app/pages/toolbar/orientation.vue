<script setup lang="ts">
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toolbar from "@zag-js/toolbar"
import "@styles/toolbar.css"

const service = useMachine(toolbar.machine, { id: useId(), orientation: "vertical" })
const api = computed(() => toolbar.connect(service, normalizeProps))

const items = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
]
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <button v-bind="api.getItemProps({ value: 'paste' })">Paste</button>
      <div v-bind="api.getSeparatorProps()" />
      <div v-bind="api.getGroupProps({ value: 'format' })">
        <button v-for="item in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          {{ item.label }}
        </button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

