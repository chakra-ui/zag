<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const formats = [
  { value: "rgba", label: "RGBA", channels: ["red", "green", "blue", "alpha"] },
  { value: "hsla", label: "HSLA", channels: ["hue", "saturation", "lightness", "alpha"] },
  { value: "hsba", label: "HSBA", channels: ["hue", "saturation", "brightness", "alpha"] },
] as const

const service = useMachine(colorPicker.machine, {
  id: useId(),
  inline: true,
  defaultFormat: "hsla",
  defaultValue: colorPicker.parse("#3b82f6"),
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
const channels = computed(() => formats.find((format) => format.value === api.value.format)?.channels ?? [])
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

          <select v-bind="api.getFormatSelectProps()">
            <option v-for="format in formats" :key="format.value" :value="format.value">{{ format.label }}</option>
          </select>

          <div class="color-picker-channel-inputs">
            <label v-for="channel in channels" :key="channel">
              {{ channel }}
              <input v-bind="api.getChannelInputProps({ channel })" />
            </label>
          </div>

          <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
          <output aria-label="Color value">{{ api.valueAsString }}</output>
        </div>
      </div>
    </div>
  </main>
</template>
