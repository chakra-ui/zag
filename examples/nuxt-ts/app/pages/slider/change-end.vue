<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const value = ref([50])
const endValue = ref([50])

const service = useMachine(slider.machine, {
  id: useId(),
  name: "brightness",
  defaultValue: [50],
  thumbSize: 20,
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
      <label v-bind="api.getLabelProps()">Brightness</label>
      <output v-bind="api.getValueTextProps()">{{ api.value.join("") }}</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
    </div>
    <div class="hstack gap-4">
      <Output label="onValueChange" :value="value[0]" />
      <Output label="onValueChangeEnd" :value="endValue[0]" />
    </div>
  </main>
</template>
