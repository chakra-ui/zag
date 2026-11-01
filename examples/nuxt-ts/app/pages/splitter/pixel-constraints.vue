<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const service = useMachine(splitter.machine, {
  id: useId(),
  defaultSize: ["240px", "60vw"],
  panels: [
    { id: "sidebar", minSize: "240px", maxSize: "360px" },
    { id: "content", minSize: 20 },
  ],
})

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'sidebar' })">
        <p>Sidebar: 240px - 360px</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'sidebar:content' })" />
      <div v-bind="api.getPanelProps({ id: 'content' })">
        <p>Content</p>
      </div>
    </div>
  </main>
</template>
