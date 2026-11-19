<script setup lang="ts">
import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/meter.css"

const CAPACITY = 512
const BACKUPS = 128
const PHOTOS = 128

const id = useId()
const used = ref(384)
const backupsDeleted = ref(false)

const service = useMachine(
  meter.machine,
  computed<meter.Props>(() => ({
    id,
    value: used.value,
    max: CAPACITY,
    low: 300,
    high: 450,
    optimum: 0,
    formatOptions: { style: "unit", unit: "gigabyte", maximumFractionDigits: 0 },
    translations: {
      value: ({ value, max, formatter }) => `${formatter.format(value)} of ${formatter.format(max)}`,
    },
  })),
)
const api = computed(() => meter.connect(service, normalizeProps))

function deleteBackups() {
  backupsDeleted.value = true
  used.value -= BACKUPS
}
</script>

<template>
  <main>
    <div class="meter-storage-quota">
      <p class="hint">Free up space or upload files and watch the quota change state.</p>
      <div v-bind="api.getRootProps()">
        <div class="header">
          <span v-bind="api.getLabelProps()">Storage used</span>
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
        </div>
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getIndicatorProps()" />
        </div>
      </div>
      <p v-if="api.valueState === 'least-optimal'" class="alert" role="alert">Storage is full. New files won't sync.</p>
      <div class="meter-actions">
        <button type="button" :disabled="backupsDeleted" @click="deleteBackups">
          Delete old backups ({{ BACKUPS }} GB)
        </button>
        <button type="button" :disabled="used + PHOTOS > CAPACITY" @click="used += PHOTOS">
          Upload photo library ({{ PHOTOS }} GB)
        </button>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
