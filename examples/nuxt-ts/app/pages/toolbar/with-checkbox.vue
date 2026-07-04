<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import * as toolbar from "@zag-js/toolbar"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"
import "@styles/checkbox.css"

const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))

const checkboxId = useId()
const checkboxService = useMachine(
  checkbox.machine,
  computed(() => ({
    id: checkboxId,
    ids: { hiddenInput: api.value.getItemId("track-changes") },
    disabled: api.value.disabled,
  })),
)
const checkboxApi = computed(() => checkbox.connect(checkboxService, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <div v-bind="api.getSeparatorProps()" />
      <label v-bind="checkboxApi.getRootProps()" class="toolbar-item">
        <div v-bind="checkboxApi.getControlProps()" />
        <input v-bind="mergeProps(checkboxApi.getHiddenInputProps(), api.getItemProps({ value: 'track-changes' }))" type="checkbox" />
        <span v-bind="checkboxApi.getLabelProps()">Track changes</span>
      </label>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

