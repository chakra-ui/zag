<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon, PlusIcon } from "lucide-vue-next"
import "@styles/color-picker.css"

const swatches = ref(["#EF4444", "#22C55E", "#3B82F6"])

const service = useMachine(colorPicker.machine, {
  id: useId(),
  defaultValue: colorPicker.parse("#3b82f6"),
})

const api = computed(() => colorPicker.connect(service, normalizeProps))

const saveSwatch = () => {
  const color = api.value.value.toString("hex")
  if (!swatches.value.includes(color)) swatches.value = [...swatches.value, color]
}
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Highlight: <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
      </label>

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
        <button v-bind="api.getTriggerProps()" class="color-picker-add-button">
          <PlusIcon :size="16" />
        </button>
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

            <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />

            <button type="button" @click="saveSwatch">Save</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
