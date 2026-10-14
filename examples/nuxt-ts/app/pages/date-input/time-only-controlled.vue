<script setup lang="ts">
import { DateFormatter, type DateValue } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-input.css"

const timeFormatter = new DateFormatter("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

const value = shallowRef<DateValue[]>([])

const id = useId()
const service = useMachine(
  dateInput.machine,
  computed(() => ({
    id,
    locale: "en-US",
    granularity: "minute",
    hourCycle: 24,
    formatter: timeFormatter,
    value: value.value,
    onValueChange(details) {
      value.value = details.value
    },
  })),
)

const api = computed(() => dateInput.connect(service, normalizeProps))
</script>

<template>
  <main class="date-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Time</label>

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
      <div>Controlled value: {{ api.valueAsString.join(", ") || "-" }}</div>
    </output>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
