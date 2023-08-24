<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(numberInputControls)

const [state, send] = useMachine(numberInput.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => numberInput.connect(state.value, send, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.rootProps">
      <div data-testid="scrubber" v-bind="api.scrubberProps" />
      <label data-testid="label" v-bind="api.labelProps"> Enter number </label>
      <div v-bind="api.controlProps">
        <button data-testid="dec-button" v-bind="api.decrementTriggerProps">DEC</button>
        <input data-testid="input" v-bind="api.inputProps" />
        <button data-testid="inc-button" v-bind="api.incrementTriggerProps">INC</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
