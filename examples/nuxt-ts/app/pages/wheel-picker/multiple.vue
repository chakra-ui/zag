<script setup lang="ts">
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
const numbers = (length: number, add = 0) =>
  wheelPicker.collection({
    items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
  })
const id = useId(),
  hour = numbers(12, 1),
  minute = numbers(60),
  period = wheelPicker.collection({ items: ["AM", "PM"].map((value) => ({ label: value, value })) })
const hourService = useMachine(wheelPicker.machine, {
  id: `${id}:hour`,
  collection: hour,
  defaultValue: "9",
  infinite: true,
})
const minuteService = useMachine(wheelPicker.machine, {
  id: `${id}:minute`,
  collection: minute,
  defaultValue: "41",
  infinite: true,
})
const periodService = useMachine(wheelPicker.machine, {
  id: `${id}:period`,
  collection: period,
  defaultValue: "AM",
})
const pickers = [
  {
    label: "Hour",
    collection: hour,
    api: computed(() => wheelPicker.connect(hourService, normalizeProps)),
  },
  {
    label: "Minute",
    collection: minute,
    api: computed(() => wheelPicker.connect(minuteService, normalizeProps)),
  },
  {
    label: "Meridiem",
    collection: period,
    api: computed(() => wheelPicker.connect(periodService, normalizeProps)),
  },
]
</script>
<template>
  <main class="wheel-picker">
    <div class="wheel-picker-group" role="group" aria-label="Time">
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
    <output>Selected time: {{ pickers.map((picker) => picker.api.value.valueAsString).join(":") }}</output>
  </main>
</template>
