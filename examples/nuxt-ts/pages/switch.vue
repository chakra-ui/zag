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
    <label v-bind="api.getRootProps()">
      <input v-bind="api.getHiddenInputProps()" />
      <span v-bind="api.getControlProps()">
        <span v-bind="api.getThumbProps()" />
      </span>
      <span v-bind="api.getLabelProps()">Feature is {{ api.checked ? "enabled" : "disabled" }}</span>
    </label>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
