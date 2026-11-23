<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const service = useMachine(colorPicker.machine, {
  id: useId(),
  defaultValue: colorPicker.parse("#3b82f6"),
  name: "color",
  format: "hsla",
  dir: "rtl",
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <form v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">اختر اللون ({{ api.valueAsString }})</label>
      <input v-bind="api.getHiddenInputProps()" />

      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <div v-bind="api.getTransparencyGridProps({ size: '4px' })" />
          <div v-bind="api.getSwatchProps({ value: api.value })" />
        </button>

        <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
        <input v-bind="api.getChannelInputProps({ channel: 'alpha' })" />
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

            <div v-bind="api.getChannelSliderProps({ channel: 'alpha' })">
              <div v-bind="api.getTransparencyGridProps({ size: '8px' })" />
              <div v-bind="api.getChannelSliderTrackProps({ channel: 'alpha' })" />
              <div v-bind="api.getChannelSliderThumbProps({ channel: 'alpha' })" />
            </div>

            <div v-if="api.format.startsWith('hsl')" class="color-picker-channel-inputs">
              <label>H <input v-bind="api.getChannelInputProps({ channel: 'hue' })" /></label> <label
                >S <input v-bind="api.getChannelInputProps({ channel: 'saturation' })"
              /></label> <label>L <input v-bind="api.getChannelInputProps({ channel: 'lightness' })" /></label> <label
                >A <input v-bind="api.getChannelInputProps({ channel: 'alpha' })"
              /></label>
            </div>

            <div v-if="api.format.startsWith('rgb')" class="color-picker-channel-inputs">
              <label>R <input v-bind="api.getChannelInputProps({ channel: 'red' })" /></label> <label
                >G <input v-bind="api.getChannelInputProps({ channel: 'green' })"
              /></label> <label>B <input v-bind="api.getChannelInputProps({ channel: 'blue' })" /></label> <label
                >A <input v-bind="api.getChannelInputProps({ channel: 'alpha' })"
              /></label>
            </div>

            <div v-if="api.format.startsWith('hsb')" class="color-picker-channel-inputs">
              <label>H <input v-bind="api.getChannelInputProps({ channel: 'hue' })" /></label> <label
                >S <input v-bind="api.getChannelInputProps({ channel: 'saturation' })"
              /></label> <label>B <input v-bind="api.getChannelInputProps({ channel: 'brightness' })" /></label> <label
                >A <input v-bind="api.getChannelInputProps({ channel: 'alpha' })"
              /></label>
            </div>
          </div>
        </div>
      </div>
    </form>
  </main>
</template>
