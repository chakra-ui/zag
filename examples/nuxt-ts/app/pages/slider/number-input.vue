<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"
import "@styles/number-input.css"

const min = 0
const max = 1000

const value = ref([200, 600])

const id = useId()
const service = useMachine(
  slider.machine,
  computed(() => ({
    id,
    name: "price",
    min,
    max,
    step: 10,
    minStepsBetweenThumbs: 10,
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Minimum price" : "Maximum price"),
    value: value.value,
    onValueChange(details: slider.ValueChangeDetails) {
      value.value = details.value
    },
  })),
)

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Price</label>
      <output v-bind="api.getValueTextProps()">${{ value[0] }} – ${{ value[1] }}</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
        </div>
      </div>
      <SliderPriceInput
        label="Min"
        :value="value[0]!"
        :min="min"
        :max="api.getThumbMax(0)"
        @change="(next) => api.setThumbValue(0, next)"
      />
      <SliderPriceInput
        label="Max"
        :value="value[1]!"
        :min="api.getThumbMin(1)"
        :max="max"
        @change="(next) => api.setThumbValue(1, next)"
      />
    </div>
  </main>
</template>
