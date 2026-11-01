<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ label: string; value: number }>()

const service = useMachine(progress.machine, {
  id: useId(),
  orientation: "vertical",
  defaultValue: props.value,
})

const api = computed(() => progress.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
    <div v-bind="api.getTrackProps()">
      <div v-bind="api.getRangeProps()" />
    </div>
    <span v-bind="api.getLabelProps()">{{ label }}</span>
  </div>
</template>
