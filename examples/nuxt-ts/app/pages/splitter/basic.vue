<script lang="ts" setup>
import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const controls = useControls(splitterControls)

const service = useMachine(
  splitter.machine,
  controls.mergeProps<splitter.Props>({
    id: useId(),
    panels: [{ id: "a" }, { id: "b" }, { id: "c" }],
  }),
)

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'a' })">
        <p>Left</p>
      </div>
      <div data-testid="trigger-a:b" v-bind="api.getResizeTriggerProps({ id: 'a:b' })" />
      <div v-bind="api.getPanelProps({ id: 'b' })">
        <p>Middle</p>
      </div>
      <div data-testid="trigger-b:c" v-bind="api.getResizeTriggerProps({ id: 'b:c' })" />
      <div v-bind="api.getPanelProps({ id: 'c' })">
        <p>Right</p>
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
