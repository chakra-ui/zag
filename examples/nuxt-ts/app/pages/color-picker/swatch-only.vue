<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon } from "lucide-vue-next"
import "@styles/color-picker.css"

const swatches = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#64748b"]

const service = useMachine(colorPicker.machine, {
  id: useId(),
  name: "color",
  defaultValue: colorPicker.parse("#22c55e"),
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Label color: <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
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
      </div>
    </div>
  </main>
</template>
