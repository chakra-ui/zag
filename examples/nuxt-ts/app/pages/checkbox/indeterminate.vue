<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(checkbox.machine, {
  id: useId(),
  name: "uncontrolled",
  defaultChecked: "indeterminate",
})

const api = computed(() => checkbox.connect(service, normalizeProps))

const checked = ref<checkbox.CheckedState>("indeterminate")
const controlledId = useId()

const controlledService = useMachine(
  checkbox.machine,
  computed(() => ({
    id: controlledId,
    name: "controlled",
    checked: checked.value,
    onCheckedChange(details) {
      checked.value = details.checked
    },
  })),
)

const controlledApi = computed(() => checkbox.connect(controlledService, normalizeProps))
</script>

<template>
  <main class="checkbox">
    <form>
      <fieldset>
        <label v-bind="api.getRootProps()">
          <div v-bind="api.getControlProps()" />
          <span v-bind="api.getLabelProps()">Uncontrolled: {{ String(api.checkedState) }}</span>
          <input v-bind="api.getHiddenInputProps()" data-testid="hidden-input" />
        </label>
        <button type="reset">Reset Form</button>
      </fieldset>
    </form>

    <label v-bind="controlledApi.getRootProps()">
      <div v-bind="controlledApi.getControlProps()" />
      <span v-bind="controlledApi.getLabelProps()">Controlled: {{ String(controlledApi.checkedState) }}</span>
      <input v-bind="controlledApi.getHiddenInputProps()" data-testid="controlled-hidden-input" />
    </label>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
