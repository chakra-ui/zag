<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const service = useMachine(splitter.machine, {
  id: useId(),
  orientation: "vertical",
  defaultSize: ["6rem", "60%", "4em"],
  panels: [
    { id: "header", minSize: "6rem", maxSize: "20vh" },
    { id: "body", minSize: "12rem" },
    { id: "footer", minSize: "4em", maxSize: "25vh" },
  ],
})

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'header' })">
        <p>Header: 6rem - 20vh</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'header:body' })" />
      <div v-bind="api.getPanelProps({ id: 'body' })">
        <p>Body: min 12rem</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'body:footer' })" />
      <div v-bind="api.getPanelProps({ id: 'footer' })">
        <p>Footer: 4em - 25vh</p>
      </div>
    </div>
  </main>
</template>
