<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"

defineProps<{ variant: "linear" | "circular" }>()

// `null` means the amount of work is unknown
const service = useMachine(progress.machine, { id: useId(), defaultValue: null })
const api = computed(() => progress.connect(service, normalizeProps))
</script>

<template>
  <div v-if="variant === 'linear'" v-bind="api.getRootProps()">
    <span v-bind="api.getLabelProps()">Loading files</span>
    <div v-bind="api.getTrackProps()">
      <div v-bind="api.getRangeProps()" />
    </div>
  </div>
  <div v-else v-bind="api.getRootProps()">
    <span v-bind="api.getLabelProps()">Connecting</span>
    <svg v-bind="api.getCircleProps()">
      <circle v-bind="api.getCircleTrackProps()" />
      <circle v-bind="api.getCircleRangeProps()" />
    </svg>
  </div>
</template>
