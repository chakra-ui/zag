<script setup lang="ts">
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/editable.css"

const props = defineProps<{
  name: string
  format: (value: string) => string
}>()

const id = useId()
const value = ref("abc")

const service = useMachine(
  editable.machine,
  computed<editable.Props>(() => ({
    id,
    value: value.value,
    onValueChange(details) {
      value.value = props.format(details.value)
    },
  })),
)

const api = computed(() => editable.connect(service, normalizeProps))
</script>

<template>
  <div :data-testid="name" v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">{{ name }}</label>
    <div v-bind="api.getAreaProps()">
      <input data-testid="input" v-bind="api.getInputProps()" />
      <span data-testid="preview" v-bind="api.getPreviewProps()">{{ api.valueText }}</span>
    </div>
    <output data-testid="value">{{ value }}</output>
  </div>
</template>
