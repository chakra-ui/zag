<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const id = useId()
const service = useMachine(angleSlider.machine, computed(() => ({ id, dir: "rtl" as const })))
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider" dir="rtl">
    <h1>Angle Slider — RTL</h1>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Angle Slider:
        <div v-bind="api.getValueTextProps()">{{ api.valueAsDegree }}</div>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()"></div>
        <div v-bind="api.getMarkerGroupProps()">
          <div
            v-for="value in [0, 45, 90, 135, 180, 225, 270, 315]"
            :key="value"
            v-bind="api.getMarkerProps({ value })"
          ></div>
        </div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
