<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const id = useId()
const value = ref(45)

const service = useMachine(
  angleSlider.machine,
  computed(() => ({
    id,
    value: value.value,
    onValueChange(details) {
      value.value = details.value
    },
  })),
)

const api = computed(() => angleSlider.connect(service, normalizeProps))

function onInput(event: Event) {
  const next = (event.target as HTMLInputElement).valueAsNumber
  value.value = Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next))
}
</script>

<template>
  <main class="angle-slider">
    <h1>Angle Slider — Controlled</h1>
    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px">
      <input type="number" :min="0" :max="359" :value="value" @input="onInput" />
      <button type="button" @click="value = 0">Reset</button>
    </div>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Angle Slider:
        <div v-bind="api.getValueTextProps()">{{ api.valueAsDegree }}</div>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()"></div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>
</template>
