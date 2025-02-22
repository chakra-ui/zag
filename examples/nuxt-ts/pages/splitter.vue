<script lang="ts" setup>
import { splitterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as splitter from "@zag-js/splitter"

const controls = useControls(splitterControls)

const service = useMachine(splitter.machine, {
  id: useId(),
  defaultSize: [
    { id: "a", size: 50 },
    { id: "b", size: 50 },
  ],
})

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'a' })">
        <p>A</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'a:b' })"></div>
      <div v-bind="api.getPanelProps({ id: 'b' })">
        <p>B</p>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['previousPanels', 'initialSize']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
