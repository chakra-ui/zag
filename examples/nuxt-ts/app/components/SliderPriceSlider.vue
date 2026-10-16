<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(slider.machine, {
  id: useId(),
  name: "price",
  defaultValue: [20, 60],
  thumbSize: 20,
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">Price</label>
    <output v-bind="api.getValueTextProps()">{{ api.value.join(" – ") }}</output>
    <div v-bind="api.getControlProps()">
      <div v-bind="api.getTrackProps()">
        <div v-bind="api.getRangeProps()" />
      </div>
      <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
        <input v-bind="api.getHiddenInputProps({ index })" />
      </div>
    </div>
  </div>
</template>
