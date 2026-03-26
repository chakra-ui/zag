<script setup lang="ts">
import styles from "../../../../../shared/src/css/pin-input.module.css"
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/vue"

const value = ref(["", "", ""])

const service = useMachine(pinInput.machine, {
  id: useId(),
  name: "test",
  count: 3,
  value: value.value,
  onValueChange(details) {
    value.value = details.value
  },
})

const api = computed(() => pinInput.connect(service, normalizeProps))
</script>

<template>
  <main class="pin-input">
    <form
      @submit="
        (e) => {
          e.preventDefault()
          console.log('submitted:', value.join(''))
        }
      "
    >
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()" :class="styles.Label">Enter code:</label>
        <div v-bind="api.getControlProps()" :class="styles.Control">
          <input
            v-for="index in api.items"
            :data-testid="`input-${index + 1}`"
            v-bind="api.getInputProps({ index })" :class="styles.Input"
          />
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem">
        <button type="button" data-testid="clear-button" @click="api.clearValue">Clear</button>
        <button type="button" @click="api.focus">Focus</button>
        <button type="button" data-testid="set-value" @click="value = ['1', '2', '3']">Set 1-2-3</button>
        <button type="button" data-testid="reset-value" @click="value = ['', '', '']">Reset</button>
      </div>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
