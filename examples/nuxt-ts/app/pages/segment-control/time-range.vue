<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { timeRanges } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

const id = useId()
const value = ref("week")

const service = useMachine(
  radio.machine,
  computed<radio.Props>(() => ({
    id,
    name: "range",
    orientation: "horizontal",
    value: value.value,
    onValueChange: (details) => {
      if (details.value) value.value = details.value
    },
  })),
)

const api = computed(() => radio.connect(service, normalizeProps))
const range = computed(() => timeRanges.find((r) => r.id === value.value)!)
const max = computed(() => Math.max(...range.value.bars))
</script>

<template>
  <main>
    <div class="segmented-control time-range">
      <p class="hint">Switch the range to redraw the chart, or jump to Year with the button.</p>
      <div v-bind="api.getRootProps()">
        <span v-bind="api.getLabelProps()">Time range</span>
        <div v-bind="api.getIndicatorProps()" />
        <label
          v-for="opt in timeRanges"
          :key="opt.id"
          :data-testid="`radio-${opt.id}`"
          v-bind="api.getItemProps({ value: opt.id })"
        >
          <span v-bind="api.getItemTextProps({ value: opt.id })">{{ opt.label }}</span>
          <input v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
        </label>
      </div>
      <div class="chart" data-testid="chart">
        <div
          v-for="(bar, i) in range.bars"
          :key="i"
          class="bar"
          data-testid="bar"
          :style="{ height: `${(bar / max) * 100}%` }"
        />
      </div>
      <p class="caption" data-testid="caption" role="status">{{ range.caption }}</p>
      <div class="actions">
        <button type="button" @click="value = 'year'">Jump to Year</button>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
