<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const presets = ["#f47373", "#697689", "#37d67a"]

const nextFieldRef = ref<HTMLInputElement | null>(null)

const service = useMachine(colorPicker.machine, {
  id: useId(),
  closeOnSelect: true,
  defaultValue: colorPicker.parse("#ff0000"),
  onValueChange() {
    nextFieldRef.value?.focus()
  },
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <div v-bind="api.getSwatchProps({ value: api.value })" />
        </button>
      </div>
      <input ref="nextFieldRef" data-testid="next-field" placeholder="Next field" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getSwatchGroupProps()" style="display: flex; gap: 8px">
            <button v-for="preset in presets" :key="preset" v-bind="api.getSwatchTriggerProps({ value: preset })">
              <div v-bind="api.getSwatchProps({ value: preset })" style="width: 20px; height: 20px" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
