<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import * as toolbar from "@zag-js/toolbar"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"

const service = useMachine(toolbar.machine, { id: useId(), orientation: "vertical" })
const api = computed(() => toolbar.connect(service, normalizeProps))

const zoomId = useId()
const numberService = useMachine(
  numberInput.machine,
  computed(() => ({
    id: zoomId,
    ids: { input: api.value.getItemId("zoom") },
    disabled: api.value.disabled,
    defaultValue: "100",
    min: 25,
    max: 400,
    step: 25,
  })),
)
const numberApi = computed(() => numberInput.connect(numberService, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <div v-bind="api.getSeparatorProps()" />
      <div v-bind="numberApi.getControlProps()">
        <button v-bind="numberApi.getDecrementTriggerProps()" aria-label="Zoom out">-</button>
        <input class="toolbar-number-input" v-bind="mergeProps(numberApi.getInputProps(), api.getInputProps({ value: 'zoom' }))" />
        <button v-bind="numberApi.getIncrementTriggerProps()" aria-label="Zoom in">+</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

