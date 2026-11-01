<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { MinusIcon, PlusIcon } from "lucide-vue-next"
import "@styles/number-input.css"

const min = 0
const max = 10

const service = useMachine(numberInput.machine, {
  id: useId(),
  allowOverflow: true,
  max,
  min,
  onValueInvalid(details) {
    if (details.valueAsNumber > max) {
      api.value.setValue(min)
    } else if (details.valueAsNumber < min) {
      api.value.setValue(max)
    }
  },
})

const api = computed(() => numberInput.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Enter number:</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getDecrementTriggerProps()">
          <MinusIcon />
        </button>
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getIncrementTriggerProps()">
          <PlusIcon />
        </button>
      </div>
    </div>
  </main>
</template>
