<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const marks = [
  { value: 0, label: "Low" },
  { value: 50, label: "Medium" },
  { value: 100, label: "High" },
]

const service = useMachine(slider.machine, {
  id: useId(),
  name: "quality",
  defaultValue: [50],
  step: 50,
  thumbSize: 20,
  getAriaValueText: ({ value }) => marks.find((mark) => mark.value === value)?.label ?? String(value),
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Quality</label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
      <div v-bind="api.getMarkerGroupProps()">
        <span v-for="mark in marks" :key="mark.value" v-bind="api.getMarkerProps({ value: mark.value })">{{
          mark.label
        }}</span>
      </div>
    </div>
  </main>
</template>
