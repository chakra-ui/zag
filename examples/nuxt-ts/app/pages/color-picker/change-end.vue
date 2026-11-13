<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const initialValue = colorPicker.parse("hsl(210, 90%, 55%)")

const liveValue = ref(initialValue.toString("hex"))
const endValue = ref(initialValue.toString("hex"))

const service = useMachine(colorPicker.machine, {
  id: useId(),
  inline: true,
  defaultValue: initialValue,
  onValueChange: (details) => {
    liveValue.value = details.value.toString("hex")
  },
  onValueChangeEnd: (details) => {
    endValue.value = details.value.toString("hex")
  },
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getContentProps()">
        <div class="content__inner">
          <div v-bind="api.getAreaProps()">
            <div v-bind="api.getAreaBackgroundProps()" />
            <div v-bind="api.getAreaThumbProps()" />
          </div>

          <div v-bind="api.getChannelSliderProps({ channel: 'hue' })">
            <div v-bind="api.getChannelSliderTrackProps({ channel: 'hue' })" />
            <div v-bind="api.getChannelSliderThumbProps({ channel: 'hue' })" />
          </div>
        </div>
      </div>
    </div>

    <div class="color-picker-readouts">
      <span>onValueChange</span>
      <output aria-label="Live value">{{ liveValue }}</output>
      <span>onValueChangeEnd</span>
      <output aria-label="Committed value">{{ endValue }}</output>
    </div>
  </main>
</template>
