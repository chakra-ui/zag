<script setup lang="ts">
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/progress.css"

const service = useMachine(progress.machine, {
  id: useId(),
  min: -20,
  max: 40,
  defaultValue: 10,
  formatOptions: { style: "unit", unit: "celsius" },
})

const api = computed(() => progress.connect(service, normalizeProps))

const syncService = useMachine(progress.machine, { id: useId(), defaultValue: 60 })
const sync = computed(() => progress.connect(syncService, normalizeProps))
</script>

<template>
  <main class="progress">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <div class="progress-header">
          <span v-bind="api.getLabelProps()">Temperature</span>
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
        </div>
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
      </div>

      <div class="hstack">
        <button @click="api.setValue(-30)">Set -30</button>
        <button @click="api.setValue(25)">Set 25</button>
        <button @click="api.setValue(50)">Set 50</button>
      </div>

      <div v-bind="sync.getRootProps()">
        <div v-bind="sync.getTrackProps()" aria-label="Syncing">
          <div v-bind="sync.getRangeProps()" />
        </div>
      </div>
    </div>
  </main>
</template>
