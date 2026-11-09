<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon } from "lucide-vue-next"
import "@styles/color-picker.css"

const swatches = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
]

const service = useMachine(colorPicker.machine, {
  id: useId(),
  name: "color",
  defaultValue: colorPicker.parse("#3b82f6"),
  closeOnSelect: true,
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Brand color</label>

      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <div v-bind="api.getTransparencyGridProps({ size: '10px' })" />
          <div v-bind="api.getSwatchProps({ value: api.value })" />
        </button>
        <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
      </div>

      <div v-bind="api.getPositionerProps()">
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

            <div v-bind="api.getSwatchGroupProps()" class="color-picker-swatches">
              <button
                v-for="swatch in swatches"
                :key="swatch"
                v-bind="api.getSwatchTriggerProps({ value: swatch })"
                class="color-picker-swatch-button"
              >
                <div v-bind="api.getSwatchProps({ value: swatch })" />
                <span v-bind="api.getSwatchIndicatorProps({ value: swatch })">
                  <CheckIcon :size="16" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
