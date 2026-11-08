<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { PipetteIcon } from "lucide-vue-next"
import "@styles/color-picker.css"

const service = useMachine(colorPicker.machine, {
  id: useId(),
  name: "color",
  defaultValue: colorPicker.parse("#f97316"),
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Text color: <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
      </label>

      <div v-bind="api.getControlProps()">
        <div class="color-picker-swatch-preview">
          <div v-bind="api.getTransparencyGridProps({ size: '8px' })" />
          <div v-bind="api.getSwatchProps({ value: api.value })" />
        </div>
        <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
        <button v-bind="api.getEyeDropperTriggerProps()">
          <PipetteIcon :size="16" />
        </button>
      </div>
    </div>
  </main>
</template>
