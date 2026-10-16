<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const presets = [
  { label: "Any", value: [0, 1000] },
  { label: "Under $250", value: [0, 250] },
  { label: "$250 – $500", value: [250, 500] },
  { label: "$500+", value: [500, 1000] },
]

const value = ref([200, 600])

const id = useId()
const service = useMachine(
  slider.machine,
  computed(() => ({
    id,
    name: "price",
    value: value.value,
    min: 0,
    max: 1000,
    step: 10,
    thumbSize: 20,
    "aria-label": ["Minimum price", "Maximum price"],
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
    </div>
    <div class="hstack">
      <button v-for="preset in presets" :key="preset.label" type="button" @click="value = preset.value">
        {{ preset.label }}
      </button>
    </div>
  </main>
</template>
