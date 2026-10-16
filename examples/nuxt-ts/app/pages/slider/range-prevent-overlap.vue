<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const service = useMachine(slider.machine, {
  id: useId(),
  name: "hours",
  defaultValue: [9, 17],
  min: 0,
  max: 24,
  minStepsBetweenThumbs: 4,
  thumbSize: 20,
  getAriaLabel: ({ index }) => (index === 0 ? "Start hour" : "End hour"),
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Opening hours</label>
      <output v-bind="api.getValueTextProps()">{{ api.value[0] }}:00 – {{ api.value[1] }}:00</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
    </div>
    <p class="slider-hint">Open at least 4 hours</p>
  </main>
</template>
