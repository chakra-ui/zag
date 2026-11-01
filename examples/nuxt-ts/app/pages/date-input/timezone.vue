<script setup lang="ts">
import { parseZonedDateTime } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-input.css"

const timeZone = "America/Los_Angeles"

const hideTimeZone = ref(false)

const id = useId()
const service = useMachine(
  dateInput.machine,
  computed(() => ({
    id,
    locale: "en-US",
    granularity: "minute",
    timeZone,
    hideTimeZone: hideTimeZone.value,
    defaultValue: [parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]")],
  })),
)

const api = computed(() => dateInput.connect(service, normalizeProps))
</script>

<template>
  <main class="date-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Meeting time</label>

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
      <div>Time zone: {{ timeZone }}</div>
    </output>

    <label> <input v-model="hideTimeZone" type="checkbox" data-testid="hide-tz" /> Hide time zone </label>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
