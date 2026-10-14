<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(slider.machine, {
  thumbSize: 20,
  id: "1",
  name: "quantity",
  defaultValue: [10, 60],
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <div class="slider">
    <div v-bind="api.getRootProps()">
      <div>
        <label v-bind="api.getLabelProps()">Quantity:</label>
        <output v-bind="api.getValueTextProps()">{{ api.value.join(" - ") }}</output>
      </div>
      <div class="control-area">
        <div v-bind="api.getControlProps()">
          <div v-bind="api.getTrackProps()">
            <div v-bind="api.getRangeProps()" />
          </div>
          <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
            <input v-bind="api.getHiddenInputProps({ index })" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
