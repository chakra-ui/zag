<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const value = ref([50])
const endValue = ref([50])

const service = useMachine(slider.machine, {
  thumbSize: 20,
  id: useId(),
  name: "quantity",
  defaultValue: [50],
  onValueChange(details) {
    value.value = details.value
  },
  onValueChangeEnd(details) {
    endValue.value = details.value
  },
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <div data-testid="track" v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>

      <div style="display: flex; gap: 16px">
        <output>Change: {{ value[0] }}</output>
        <output>Change end: {{ endValue[0] }}</output>
      </div>
    </div>
  </main>
</template>
