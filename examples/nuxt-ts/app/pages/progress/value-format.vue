<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/progress.css"

const service = useMachine(progress.machine, {
  id: useId(),
  max: 12,
  defaultValue: 4,
  translations: {
    value: ({ value, max }) => (value == null ? "Preparing…" : `${value} of ${max} files`),
  },
})

const api = computed(() => progress.connect(service, normalizeProps))
</script>

<template>
  <main class="progress">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <div class="progress-header">
          <span v-bind="api.getLabelProps()">Copying files</span>
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
        </div>
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
      </div>

      <div class="hstack">
        <button @click="api.setValue(Math.max(0, (api.value ?? 0) - 1))">Previous</button>
        <button @click="api.setValue(Math.min(api.max, (api.value ?? 0) + 1))">Next file</button>
      </div>
    </div>
  </main>
</template>
