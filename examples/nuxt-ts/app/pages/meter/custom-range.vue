<script setup lang="ts">
import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/meter.css"

const service = useMachine(meter.machine, {
  id: useId(),
  min: -20,
  max: 40,
  low: 0,
  high: 25,
  optimum: 18,
  defaultValue: 10,
  formatOptions: { style: "unit", unit: "celsius" },
})

const api = computed(() => meter.connect(service, normalizeProps))

const diskService = useMachine(meter.machine, { id: useId(), defaultValue: 30 })
const disk = computed(() => meter.connect(diskService, normalizeProps))
</script>

<template>
  <main class="meter">
    <div v-bind="api.getRootProps()">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span v-bind="api.getLabelProps()">Temperature</span>
        <span v-bind="api.getValueTextProps()">{{ api.valueAsString }} · {{ api.percentAsString }}</span>
      </div>
      <div v-bind="api.getTrackProps()">
        <div v-bind="api.getIndicatorProps()" />
      </div>
    </div>

    <div class="meter-actions">
      <button type="button" @click="api.setValue(-30)">Set -30</button>
      <button type="button" @click="api.setValue(18)">Set 18</button>
      <button type="button" @click="api.setValue(50)">Set 50</button>
    </div>

    <div v-bind="disk.getRootProps()" aria-label="Disk usage">
      <div v-bind="disk.getTrackProps()">
        <div v-bind="disk.getIndicatorProps()" />
      </div>
    </div>
  </main>
</template>
