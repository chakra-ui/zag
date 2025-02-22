<script setup lang="ts">
import * as pinInput from "@zag-js/pin-input"
import { pinInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(pinInputControls)

const service = useMachine(pinInput.machine, {
  id: useId(),
  name: "test",
})

const api = computed(() => pinInput.connect(service, normalizeProps))
</script>

<template>
  <main class="pin-input">
    <form
      @submit="
        (e) => {
          e.preventDefault()
          const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
          console.log(formData)
        }
      "
    >
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Enter code:</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input-1" v-bind="api.getInputProps({ index: 0 })" />
          <input data-testid="input-2" v-bind="api.getInputProps({ index: 1 })" />
          <input data-testid="input-3" v-bind="api.getInputProps({ index: 2 })" />
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>
      <button data-testid="clear-button" @click="api.clearValue">Clear</button>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
