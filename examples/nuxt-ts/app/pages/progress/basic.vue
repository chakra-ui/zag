<script setup lang="ts">
import styles from "../../../../../shared/src/css/progress.module.css"
import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(progressControls)

const service = useMachine(
  progress.machine,
  controls.mergeProps<progress.Props>({
    id: useId(),
  }),
)

const api = computed(() => progress.connect(service, normalizeProps))
</script>

<template>
  <main class="progress">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getLabelProps()">Upload progress</div>
      <svg v-bind="api.getCircleProps()" :class="styles.Circle">
        <circle v-bind="api.getCircleTrackProps()" :class="styles.CircleTrack" />
        <circle v-bind="api.getCircleRangeProps()" :class="styles.CircleRange" />
      </svg>
      <div v-bind="api.getTrackProps()" :class="styles.Track">
        <div v-bind="api.getRangeProps()" :class="styles.Range" />
      </div>
      <div v-bind="api.getValueTextProps()">{{ api.valueAsString }}</div>
      <div>
        <button @click="() => api.setValue((api.value ?? 0) - 20)">Decrease</button>
        <button @click="() => api.setValue((api.value ?? 0) + 20)">Increase</button>
        <button @click="() => api.setValue(null)">Indeterminate</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
