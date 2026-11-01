<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/progress.css"

const service = useMachine(progress.machine, {
  id: useId(),
  defaultValue: 40,
})

const api = computed(() => progress.connect(service, normalizeProps))
</script>

<template>
  <main class="progress">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <span v-bind="api.getLabelProps()">Syncing</span>
        <div class="progress-circle-wrap">
          <svg v-bind="api.getCircleProps()">
            <circle v-bind="api.getCircleTrackProps()" />
            <circle v-bind="api.getCircleRangeProps()" />
          </svg>
          <span v-bind="api.getValueTextProps()">{{ api.percentAsString }}</span>
        </div>
      </div>

      <div class="hstack">
        <button @click="api.setValue((api.value ?? 0) - 20)">Decrease</button>
        <button @click="api.setValue((api.value ?? 0) + 20)">Increase</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
