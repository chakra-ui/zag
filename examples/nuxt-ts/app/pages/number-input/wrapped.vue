<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { MinusIcon, PlusIcon } from "lucide-vue-next"
import "@styles/number-input.css"

const min = 0
const max = 10

// No min/max on the machine, so stepping never stops at the bounds
const service = useMachine(numberInput.machine, {
  id: useId(),
  defaultValue: 8,
  onValueChange({ value, reason }) {
    if (value == null || reason === "input-change") return
    if (value > max) api.value.setValue(min)
    else if (value < min) api.value.setValue(max)
  },
  // Typed values clamp instead of wrapping
  onValueCommit({ value }) {
    if (value == null) return
    if (value > max) api.value.setValue(max)
    else if (value < min) api.value.setValue(min)
  },
})

const api = computed(() => numberInput.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Wraps between 0 and 10</label>
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
