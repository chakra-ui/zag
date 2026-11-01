<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const service = useMachine(angleSlider.machine, { id: useId(), defaultValue: 120 })
const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider angle-slider-knob">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Shadow angle
        <span v-bind="api.getValueTextProps()">{{ api.value }}°</span>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()" />
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
