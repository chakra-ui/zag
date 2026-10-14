<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/vue"

defineProps<{ label: string; testId: string }>()

const service = useMachine(checkbox.machine, { id: useId() })
const api = computed(() => checkbox.connect(service, normalizeProps))
</script>

<template>
  <label v-bind="api.getRootProps()" :data-testid="testId" style="display: flex; gap: 8px; align-items: center">
    <div v-bind="api.getControlProps()" style="width: 18px; height: 18px; border: 2px solid #888" />
    <span v-bind="api.getLabelProps()">{{ label }}</span>
    <input v-bind="api.getHiddenInputProps()" />
  </label>
</template>
