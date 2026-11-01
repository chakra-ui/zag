<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const service = useMachine(angleSlider.machine, { id: useId(), defaultValue: 210 })
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider angle-slider-hue">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Hue
        <span v-bind="api.getValueTextProps()">{{ api.value }}°</span>
      </label>
      <div v-bind="api.getControlProps()">
        <div class="angle-slider-hue-preview" :style="{ background: `hsl(${api.value} 90% 55%)` }" />
        <div v-bind="api.getThumbProps()" />
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
