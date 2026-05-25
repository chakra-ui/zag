<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider-custom.css"

const id = useId()
const service = useMachine(angleSlider.machine, computed(() => ({ id })))
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider angle-slider-circular">
    <h1>Angle Slider — Circular Thumb</h1>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Angle Slider:
        <div v-bind="api.getValueTextProps()">{{ api.valueAsDegree }}</div>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()"></div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
