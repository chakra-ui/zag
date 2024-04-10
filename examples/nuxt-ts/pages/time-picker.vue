<script setup lang="ts">
import * as timePicker from "@zag-js/time-picker"
import { timePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(timePicker.machine({ id: "1" }))

const api = computed(() => timePicker.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="time-picker">
    <div v-bind="api.rootProps"></div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
