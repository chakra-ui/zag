<script setup lang="ts">
import { CalendarDate } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-input.css"

const service = useMachine(dateInput.machine, {
  id: useId(),
  min: new CalendarDate(2000, 1, 1),
  max: new CalendarDate(2030, 12, 31),
})

const api = computed(() => dateInput.connect(service, normalizeProps))
</script>

<template>
  <main class="date-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Date (min: 2000-01-01, max: 2030-12-31)</label>

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
      <div>Placeholder: {{ api.placeholderValue.toString() }}</div>
      <div>Editing: {{ api.displayValues?.[0]?.toString() ?? "-" }}</div>
    </output>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
