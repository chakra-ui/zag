<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider-custom.css"

const id = useId()
const service = useMachine(angleSlider.machine, computed(() => ({ id, defaultValue: 0 })))
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider angle-slider-color-wheel">
    <h1>Angle Slider — Color Wheel (Hue)</h1>
    <div class="swatch" :style="{ background: `hsl(${api.value} 100% 50%)` }" />
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Hue:
        <div v-bind="api.getValueTextProps()">{{ api.value }}°</div>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()"></div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
