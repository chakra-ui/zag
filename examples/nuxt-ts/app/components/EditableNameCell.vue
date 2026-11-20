<script setup lang="ts">
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ row: number; defaultName: string }>()
const emit = defineEmits<{ log: [entry: string] }>()

const name = ref(props.defaultName)

const service = useMachine(editable.machine, {
  id: useId(),
  defaultValue: props.defaultName,
  activationMode: "dblclick",
  translations: { edit: `Rename row ${props.row}` },
  onValueCommit: (details) => {
    if (details.value !== name.value) emit("log", `Renamed ${name.value} to ${details.value}`)
    name.value = details.value
  },
  onValueRevert: (details) => emit("log", `Kept ${details.value}`),
})
const api = computed(() => editable.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label class="visually-hidden" v-bind="api.getLabelProps()">Name, row {{ props.row }}</label>
    <div v-bind="api.getAreaProps()">
      <input v-bind="api.getInputProps()" />
      <span v-bind="api.getPreviewProps()">{{ api.valueText }}</span>
    </div>
  </div>
</template>
