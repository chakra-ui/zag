<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const marks = [0, 25, 50, 75, 100]

const service = useMachine(slider.machine, {
  id: useId(),
  name: "quantity",
  defaultValue: [20, 60],
  thumbSize: 20,
  getAriaLabel: ({ index }) => (index === 0 ? "Minimum quantity" : "Maximum quantity"),
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Quantity</label>
      <output v-bind="api.getValueTextProps()">{{ api.value.join(" – ") }}</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
      <div v-bind="api.getMarkerGroupProps()">
        <span v-for="value in marks" :key="value" v-bind="api.getMarkerProps({ value })">{{ value }}</span>
      </div>
    </div>
  </main>
</template>
