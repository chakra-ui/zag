<script setup lang="ts">
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toolbar from "@zag-js/toolbar"
import "@styles/toolbar.css"

const service = useMachine(toolbar.machine, { id: useId(), dir: "rtl" })
const api = computed(() => toolbar.connect(service, normalizeProps))
</script>

<template>
  <main class="toolbar" dir="rtl">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <button v-bind="api.getItemProps({ value: 'paste' })">Paste</button>
      <button v-bind="api.getItemProps({ value: 'select-all' })">Select All</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

