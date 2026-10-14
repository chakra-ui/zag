<script setup lang="ts">
import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/vue"

defineProps<{ label: string; testId: string }>()

const service = useMachine(zagSwitch.machine, { id: useId() })
const api = computed(() => zagSwitch.connect(service, normalizeProps))
</script>

<template>
  <label v-bind="api.getRootProps()" :data-testid="testId" style="display: flex; gap: 8px; align-items: center">
    <input v-bind="api.getHiddenInputProps()" />
    <span v-bind="api.getControlProps()" style="width: 30px; height: 18px; background: #bbb; border-radius: 9px">
      <span v-bind="api.getThumbProps()" />
    </span>
    <span v-bind="api.getLabelProps()">{{ label }}</span>
  </label>
</template>
