<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const presets = [0, 25, 50, 100]

const value = ref([25])

const id = useId()
const service = useMachine(
  slider.machine,
  computed(() => ({
    id,
    name: "zoom",
    value: value.value,
    thumbSize: 20,
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
      <label v-bind="api.getLabelProps()">Zoom</label>
      <output v-bind="api.getValueTextProps()">{{ value[0] }}%</output>
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
      <button v-for="preset in presets" :key="preset" type="button" @click="value = [preset]">{{ preset }}%</button>
    </div>
  </main>
</template>
