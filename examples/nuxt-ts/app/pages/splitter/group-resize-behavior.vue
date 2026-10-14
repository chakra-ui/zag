<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const service = useMachine(splitter.machine, {
  id: useId(),
  defaultSize: ["250px", "70%"],
  panels: [
    { id: "left", minSize: "125px", resizeBehavior: "preserve-pixel-size" },
    { id: "right", minSize: "125px" },
  ],
})

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'left' })">
        <p>Left: preserves pixel size on group resize</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'left:right' })" />
      <div v-bind="api.getPanelProps({ id: 'right' })">
        <p>Right: absorbs group resize</p>
      </div>
    </div>
  </main>
</template>
