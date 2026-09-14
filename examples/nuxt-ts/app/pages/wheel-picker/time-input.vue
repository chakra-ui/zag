<script setup lang="ts">
import * as dateInput from "@zag-js/date-input"
import * as popover from "@zag-js/popover"
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, ref } from "vue"

const numbers = (length: number, add = 0) =>
  wheelPicker.collection({
    items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
  })

const id = useId()
const value = ref<dateInput.DateValue[]>([])
const hour = ref("12")
const minute = ref("00")
const dayPeriod = ref("am")
const hourCollection = numbers(12, 1)
const minuteCollection = numbers(60)
const periodCollection = wheelPicker.collection({
  items: [
    { label: "AM", value: "am" },
    { label: "PM", value: "pm" },
  ],
})

const dateService = useMachine(
  dateInput.machine,
  computed(() => ({
    id: `${id}:input`,
    locale: "en-US",
    granularity: "minute" as const,
    maxGranularity: "hour" as const,
    shouldForceLeadingZeros: true,
    value: value.value,
    onValueChange: (details: dateInput.ValueChangeDetails) => {
      value.value = details.value
    },
  })),
)
const popoverService = useMachine(popover.machine, {
  id: `${id}:popover`,
  positioning: { placement: "bottom" },
  modal: true,
})
const dateApi = computed(() => dateInput.connect(dateService, normalizeProps))
const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))

function updateTime() {
  const current = dateApi.value.value[0] ?? dateApi.value.placeholderValue
  if (!("hour" in current)) return
  const hours = (Number(hour.value) % 12) + (dayPeriod.value === "pm" ? 12 : 0)
  value.value = [current.set({ hour: hours, minute: Number(minute.value) })]
}

const hourService = useMachine(
  wheelPicker.machine,
  computed(() => ({
    id: `${id}:hour`,
    collection: hourCollection,
    value: hour.value,
    infinite: true,
    onValueChange: (details: wheelPicker.ValueChangeDetails) => {
      if (details.value) {
        hour.value = details.value
        updateTime()
      }
    },
  })),
)
const minuteService = useMachine(
  wheelPicker.machine,
  computed(() => ({
    id: `${id}:minute`,
    collection: minuteCollection,
    value: minute.value,
    infinite: true,
    onValueChange: (details: wheelPicker.ValueChangeDetails) => {
      if (details.value) {
        minute.value = details.value
        updateTime()
      }
    },
  })),
)
const periodService = useMachine(
  wheelPicker.machine,
  computed(() => ({
    id: `${id}:period`,
    collection: periodCollection,
    value: dayPeriod.value,
    onValueChange: (details: wheelPicker.ValueChangeDetails) => {
      if (details.value) {
        dayPeriod.value = details.value
        updateTime()
      }
    },
  })),
)
const pickers = [
  { label: "Hour", api: computed(() => wheelPicker.connect(hourService, normalizeProps)) },
  { label: "Minute", api: computed(() => wheelPicker.connect(minuteService, normalizeProps)) },
  { label: "Day period", api: computed(() => wheelPicker.connect(periodService, normalizeProps)) },
]
</script>

<template>
  <main class="date-input wheel-picker wheel-picker-time-input">
    <div v-bind="dateApi.getRootProps()">
      <label v-bind="dateApi.getLabelProps()">Time</label>
      <div class="wheel-picker-time-field" v-bind="popoverApi.getAnchorProps()">
        <div v-bind="dateApi.getControlProps()">
          <div v-bind="dateApi.getSegmentGroupProps()">
            <span
              v-for="(segment, index) in dateApi.getSegments()"
              :key="index"
              v-bind="dateApi.getSegmentProps({ segment })"
              >{{ segment.text }}</span
            >
          </div>
        </div>
        <button aria-label="Open time picker" v-bind="popoverApi.getTriggerProps()">🕘</button>
      </div>
      <input v-bind="dateApi.getHiddenInputProps()" />
    </div>

    <div v-bind="popoverApi.getPositionerProps()">
      <div class="wheel-picker-time-content" v-bind="popoverApi.getContentProps()">
        <div class="sr-only" v-bind="popoverApi.getTitleProps()">Select time</div>
        <div class="wheel-picker-group" role="group" aria-label="Time picker">
          <div v-for="picker in pickers" :key="picker.label" v-bind="picker.api.value.getRootProps()">
            <label class="sr-only" v-bind="picker.api.value.getLabelProps()">{{ picker.label }}</label>
            <div v-bind="picker.api.value.getControlProps()">
              <div v-bind="picker.api.value.getViewportProps()">
                <ul v-bind="picker.api.value.getItemGroupProps()">
                  <li
                    v-for="{ item, index, key } in picker.api.value.items"
                    :key="key"
                    v-bind="picker.api.value.getItemProps({ item, index })"
                  >
                    {{ item.label }}
                  </li>
                </ul>
                <div v-bind="picker.api.value.getHighlightProps()">
                  <ul v-bind="picker.api.value.getHighlightItemGroupProps()">
                    <li
                      v-for="{ item, index, key } in picker.api.value.highlightItems"
                      :key="key"
                      v-bind="picker.api.value.getHighlightItemProps({ item, index })"
                    >
                      {{ item.label }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <output data-testid="value">Selected time: {{ dateApi.valueAsString[0] ?? "-" }}</output>
  </main>
</template>
