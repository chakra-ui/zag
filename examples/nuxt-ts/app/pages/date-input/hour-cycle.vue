<script setup lang="ts">
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-input.css"

// Forces 24-hour time regardless of the user's locale.
const service = useMachine(dateInput.machine, {
  id: useId(),
  locale: "en-US",
  granularity: "minute",
  hourCycle: 24,
})

const api = computed(() => dateInput.connect(service, normalizeProps))
</script>

<template>
  <main class="date-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Appointment time</label>

      <div v-bind="api.getControlProps()">
        <div v-bind="api.getSegmentGroupProps()">
          <span v-for="(segment, i) in api.getSegments()" :key="i" v-bind="api.getSegmentProps({ segment })">{{
            segment.text
          }}</span>
        </div>
      </div>

      <input v-bind="api.getHiddenInputProps()" />
    </div>

    <output class="date-output">
      <div>Selected: {{ api.valueAsString.join(", ") || "-" }}</div>
    </output>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
