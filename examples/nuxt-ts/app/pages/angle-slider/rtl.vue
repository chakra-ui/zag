<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]

const service = useMachine(angleSlider.machine, { id: useId(), dir: "rtl" })
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider" dir="rtl">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        الدوران
        <span v-bind="api.getValueTextProps()">{{ api.value }}°</span>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()" />
        <div v-bind="api.getMarkerGroupProps()">
          <div v-for="value in MARKERS" :key="value" v-bind="api.getMarkerProps({ value })" />
        </div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
