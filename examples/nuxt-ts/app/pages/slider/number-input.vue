<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { nan } from "@zag-js/utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"
import "@styles/number-input.css"

const min = 500
const max = 5000
const minStepsBetweenThumbs = 100

function getAdjustedValue(value: number[]) {
  let [start, end] = value as [number, number]

  const isOverflowing = start > end || end > max || start < min
  if (!isOverflowing) return value

  if (start > end || start < min) start = min
  if (end > max) end = max
  if (end < start) end = start + minStepsBetweenThumbs

  return [start, end]
}

const value = ref([max / 4, max / 2])

const id = useId()
const service = useMachine(
  slider.machine,
  computed(() => ({
    thumbSize: 20,
    id,
    name: "quantity",
    min,
    max,
    minStepsBetweenThumbs,
    thumbAlignment: "center" as const,
    "aria-label": ["Minimum Price", "Maximum Price"],
    value: getAdjustedValue(value.value),
    onValueChange(details: slider.ValueChangeDetails) {
      value.value = details.value
    },
  })),
)

const api = computed(() => slider.connect(service, normalizeProps))

function onChange(i: number, v: string) {
  const next = [...value.value]
  next[i] = nan(parseFloat(v))
  value.value = next
}
</script>

<template>
  <main class="slider">
    <div v-bind="api.getRootProps()">
      <div>
        <output v-bind="api.getValueTextProps()">{{ api.value.join(" - ") }}</output>
      </div>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })" />
      </div>
    </div>

    <div style="display: flex; gap: 40px">
      <SliderPriceNumberInput
        v-for="(v, i) in value"
        :key="i"
        :value="v.toString()"
        :min="api.getThumbMin(i)"
        :max="api.getThumbMax(i)"
        @change="(next) => onChange(i, next)"
      />
    </div>
  </main>
</template>
