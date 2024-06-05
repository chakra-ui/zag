<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(progressControls)

const [state, send] = useMachine(progress.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => progress.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="progress">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getLabelProps()">Upload progress</div>
      <svg v-bind="api.getCircleProps()">
        <circle v-bind="api.getCircleTrackProps()" />
        <circle v-bind="api.getCircleRangeProps()" />
      </svg>
      <div v-bind="api.getTrackProps()">
        <div v-bind="api.getRangeProps()" />
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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
