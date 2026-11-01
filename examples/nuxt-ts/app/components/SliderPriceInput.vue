<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ label: string; value: number; min: number; max: number }>()
const emit = defineEmits<{ change: [value: number] }>()

const draft = ref<string | null>(null)

const id = useId()
const service = useMachine(
  numberInput.machine,
  computed(() => ({
    id,
    value: draft.value ?? String(props.value),
    min: props.min,
    max: props.max,
    formatOptions: { style: "currency" as const, currency: "USD", maximumFractionDigits: 0 },
    onValueChange(details: numberInput.ValueChangeDetails) {
      draft.value = details.value
    },
    onValueCommit(details: numberInput.ValueChangeDetails) {
      if (!Number.isNaN(details.valueAsNumber)) emit("change", details.valueAsNumber)
      draft.value = null
    },
  })),
)

const api = computed(() => numberInput.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">{{ label }}</label>
    <input v-bind="api.getInputProps()" />
  </div>
</template>
