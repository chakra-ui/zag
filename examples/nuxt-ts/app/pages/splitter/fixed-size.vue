<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const service = useMachine(splitter.machine, {
  id: useId(),
  defaultSize: [50, 50],
  panels: [
    { id: "left", minSize: 20 },
    { id: "right", minSize: 20 },
  ],
})

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'left' })">
        <p>Left</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'left:' })" />
      <div
        style="
          flex: 0 0 180px;
          width: 180px;
          display: grid;
          place-items: center;
          overflow: auto;
          background: #334155;
          color: white;
          padding: 16px;
        "
      >
        Fixed sized element
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: ':right' })" />
      <div v-bind="api.getPanelProps({ id: 'right' })">
        <p>Right</p>
      </div>
    </div>
  </main>
</template>
