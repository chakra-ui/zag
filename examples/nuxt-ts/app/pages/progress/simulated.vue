<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/progress.css"

const running = ref(false)

const service = useMachine(progress.machine, {
  id: useId(),
  defaultValue: 0,
})

const api = computed(() => progress.connect(service, normalizeProps))

watch(running, (isRunning, _, onCleanup) => {
  if (!isRunning) return
  const id = setInterval(() => {
    const next = Math.min(100, (service.context.get("value") ?? 0) + Math.ceil(Math.random() * 12))
    api.value.setValue(next)
    if (next === 100) running.value = false
  }, 300)
  onCleanup(() => clearInterval(id))
})

const start = () => {
  api.value.setValue(0)
  running.value = true
}
</script>

<template>
  <main class="progress">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <div class="progress-header">
          <span v-bind="api.getLabelProps()">report.pdf</span>
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
        </div>
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <span v-bind="api.getViewProps({ state: 'loading' })">Uploading…</span>
        <span v-bind="api.getViewProps({ state: 'complete' })">Upload complete</span>
      </div>

      <div class="hstack">
        <button :disabled="running" @click="start">
          {{ api.value === 100 ? "Upload again" : "Start upload" }}
        </button>
      </div>
    </div>
  </main>
</template>
