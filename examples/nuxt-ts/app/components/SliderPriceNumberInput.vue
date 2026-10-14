<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ value: string; min: number; max: number }>()
const emit = defineEmits<{ change: [value: string] }>()

const id = useId()
const service = useMachine(
  numberInput.machine,
  computed(() => ({
    id,
    value: props.value,
    min: props.min,
    max: props.max,
    onValueChange(details: numberInput.ValueChangeDetails) {
      emit("change", details.value)
    },
  })),
)

const api = computed(() => numberInput.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-bind="mergeProps(api.getControlProps(), { style: { display: 'flex' } })">
      <span style="font-size: 12px; padding-inline: 4px; padding-block: 2.5px; border: 1px inset black">USD</span>
      <input v-bind="api.getInputProps()" />
    </div>
  </div>
</template>
