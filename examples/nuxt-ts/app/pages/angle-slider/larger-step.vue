<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const STEP = 45
const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

const service = useMachine(angleSlider.machine, { id: useId(), step: STEP })
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Wind direction
        <span v-bind="api.getValueTextProps()">
          {{ api.value }}° {{ DIRECTIONS[Math.round(api.value / STEP) % DIRECTIONS.length] }}
        </span>
      </label>
      <div v-bind="api.getControlProps()">
        <div class="angle-slider-compass" aria-hidden="true">
          <span>N</span>
          <span>E</span>
          <span>S</span>
          <span>W</span>
        </div>
        <div v-bind="api.getThumbProps()" />
        <div v-bind="api.getMarkerGroupProps()">
          <div v-for="value in MARKERS" :key="value" v-bind="api.getMarkerProps({ value })" />
        </div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
