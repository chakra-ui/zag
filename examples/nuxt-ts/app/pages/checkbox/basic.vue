<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { CheckIcon } from "lucide-vue-next"
import "@styles/checkbox.css"

const controls = useControls(checkboxControls)

const service = useMachine(
  checkbox.machine,
  controls.mergeProps<checkbox.Props>({
    id: useId(),
  }),
)

const api = computed(() => checkbox.connect(service, normalizeProps))

const onFormChange = (e: Event) => {
  const result = serialize(e.currentTarget as HTMLFormElement, { hash: true })
  console.log(result)
}
</script>

<template>
  <main class="checkbox">
    <form class="vstack gap-4" @change="onFormChange">
      <label v-bind="api.getRootProps()">
        <div v-bind="api.getControlProps()">
          <span v-bind="api.getIndicatorProps()">
            <CheckIcon />
          </span>
        </div>
        <span v-bind="api.getLabelProps()">Accept terms and conditions</span>
        <input v-bind="api.getHiddenInputProps()" data-testid="hidden-input" />
      </label>

      <div class="hstack">
        <button type="button" :disabled="api.checked" @click="api.setChecked(true)">Check</button>
        <button type="button" :disabled="!api.checked" @click="api.setChecked(false)">Uncheck</button>
        <button type="reset">Reset Form</button>
      </div>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
