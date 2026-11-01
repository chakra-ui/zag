<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const service = useMachine(slider.machine, {
  id: useId(),
  name: "temperature",
  defaultValue: [21],
  min: 10,
  max: 30,
  thumbSize: 20,
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Temperature</label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
        <span v-bind="api.getDraggingIndicatorProps({ index: 0 })">{{ api.getThumbValue(0) }}°C</span>
      </div>
    </div>
  </main>
</template>
