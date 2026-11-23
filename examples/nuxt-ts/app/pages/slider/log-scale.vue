<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const service = useMachine(slider.machine, {
  id: useId(),
  name: "frequency",
  defaultValue: [440],
  min: 20,
  max: 20000,
  thumbSize: 20,
  scale: "log",
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Frequency</label>
      <output v-bind="api.getValueTextProps()">{{ api.getThumbValue(0) }} Hz</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
    </div>
  </main>
</template>
