<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(numberInputControls)

const service = useMachine(numberInput.machine, {
  id: useId(),
})

const api = computed(() => numberInput.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <div data-testid="scrubber" v-bind="api.getScrubberProps()" />
      <label data-testid="label" v-bind="api.getLabelProps()"> Enter number </label>
      <div v-bind="api.getControlProps()">
        <button data-testid="dec-button" v-bind="api.getDecrementTriggerProps()">DEC</button>
        <input data-testid="input" v-bind="api.getInputProps()" />
        <button data-testid="inc-button" v-bind="api.getIncrementTriggerProps()">INC</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['formatter', 'parser']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
