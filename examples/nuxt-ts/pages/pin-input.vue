<script setup lang="ts">
import * as pinInput from "@zag-js/pin-input"
import { pinInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(pinInputControls)

const service = useMachine(
  pinInput.machine,
  controls.mergeProps<pinInput.Props>({
    id: useId(),
    name: "test",
    count: 3,
  }),
)

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
          <input v-for="index in api.items" :data-testid="`input-${index + 1}`" v-bind="api.getInputProps({ index })" />
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
