<script lang="ts" setup>
import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const controls = useControls(splitterControls)

const service = useMachine(splitter.machine, {
  id: useId(),
  panels: [
    { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 20 },
    { id: "b", minSize: 50 },
  ],
  defaultSize: [15, 85],
  onCollapse: (details) => {
    console.log("onCollapse", details)
  },
  onExpand: (details) => {
    console.log("onExpand", details)
  },
})

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'a' })">
        <p>A</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'a:b' })" />
      <div v-bind="api.getPanelProps({ id: 'b' })">
        <p>B</p>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
