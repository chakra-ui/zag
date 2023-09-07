<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(checkboxControls)

const [state, send] = useMachine(
  checkbox.machine({
    name: "checkbox",
    id: "v1",
  }),
  { context: controls.context },
)

const api = computed(() => checkbox.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="checkbox">
    <form
      @change="
        (e) => {
          const result = serialize(e.currentTarget as HTMLFormElement, { hash: true })
          console.log(result)
        }
      "
    >
      <fieldset>
        <label v-bind="api.rootProps">
          <div v-bind="api.controlProps" />
          <span v-bind="api.labelProps">Input {{ api.isChecked ? "Checked" : "Unchecked" }}</span>
          <input v-bind="api.hiddenInputProps" data-testid="hidden-input" />
        </label>

        <button type="button" :disabled="api.isChecked" @click="() => api.setChecked(true)">Check</button>
        <button type="button" :disabled="!api.isChecked" @click="() => api.setChecked(false)">Uncheck</button>
        <button type="reset">Reset Form</button>
      </fieldset>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
