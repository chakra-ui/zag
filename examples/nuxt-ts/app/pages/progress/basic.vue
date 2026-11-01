<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/progress.css"

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
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <div class="progress-header">
          <span v-bind="api.getLabelProps()">Upload progress</span>
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
        </div>
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
      </div>

      <div class="hstack">
        <button @click="api.setValue((api.value ?? 0) - 20)">Decrease</button>
        <button @click="api.setValue((api.value ?? 0) + 20)">Increase</button>
        <button @click="api.setValue(null)">Indeterminate</button>
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
