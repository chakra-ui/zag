<script setup lang="ts">
import * as pinInput from "@zag-js/pin-input"
import { pinInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import "@styles/pin-input.css"

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

const onSubmit = (e: Event) => {
  const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
  console.log(formData)
}
</script>

<template>
  <main class="pin-input">
    <form class="vstack gap-4" @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Enter code:</label>
        <div v-bind="api.getControlProps()">
          <input
            v-for="index in api.items"
            :key="index"
            :data-testid="`input-${index + 1}`"
            v-bind="api.getInputProps({ index })"
          />
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>
      <div class="hstack">
        <button data-testid="clear-button" @click="api.clearValue">Clear</button>
        <button @click="api.focus">Focus</button>
      </div>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'focusedIndex']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
