<script setup lang="ts">
import styles from "../../../../../shared/src/css/switch.module.css"
import * as zagSwitch from "@zag-js/switch"
import { switchControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(switchControls)

const service = useMachine(
  zagSwitch.machine,
  controls.mergeProps<zagSwitch.Props>({
    name: "switch",
    id: useId(),
  }),
)

const api = computed(() => zagSwitch.connect(service, normalizeProps))
</script>

<template>
  <main class="switch">
    <label v-bind="api.getRootProps()" :class="styles.Root">
      <input v-bind="api.getHiddenInputProps()" />
      <span v-bind="api.getControlProps()" :class="styles.Control">
        <span v-bind="api.getThumbProps()" :class="styles.Thumb" />
      </span>
      <span v-bind="api.getLabelProps()" :class="styles.Label">Feature is {{ api.checked ? "enabled" : "disabled" }}</span>
    </label>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
