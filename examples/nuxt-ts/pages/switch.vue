<script setup lang="ts">
import * as zagSwitch from "@zag-js/switch"
import { switchControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(switchControls)

const [state, send] = useMachine(
  zagSwitch.machine({
    name: "switch",
    id: "1",
  }),
  { context: controls.context },
)

const api = computed(() => zagSwitch.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="switch">
    <label v-bind="api.rootProps">
      <input v-bind="api.hiddenInputProps" />
      <span v-bind="api.controlProps">
        <span v-bind="api.thumbProps" />
      </span>
      <span v-bind="api.labelProps">Feature is {{ api.isChecked ? "enabled" : "disabled" }}</span>
    </label>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
