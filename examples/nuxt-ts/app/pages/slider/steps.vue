<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const weights: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
}

const stops = Object.keys(weights).map(Number)

const service = useMachine(slider.machine, {
  id: useId(),
  name: "font-weight",
  defaultValue: [400],
  min: 100,
  max: 900,
  step: 100,
  largeStep: 200,
  thumbSize: 20,
  getAriaValueText: ({ value }) => `${value} ${weights[value]}`,
})

const api = computed(() => slider.connect(service, normalizeProps))
const weight = computed(() => api.value.value[0]!)
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Font weight</label>
      <output v-bind="api.getValueTextProps()">{{ weight }} · {{ weights[weight] }}</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
      <div v-bind="api.getMarkerGroupProps()">
        <span v-for="value in stops" :key="value" v-bind="api.getMarkerProps({ value })" />
      </div>
    </div>
    <p :style="{ fontWeight: weight }">The quick brown fox</p>
  </main>
</template>
