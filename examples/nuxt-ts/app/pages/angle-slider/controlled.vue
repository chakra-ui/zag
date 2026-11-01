<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/angle-slider.css"

const PRESETS = [0, 90, 180, 270]

const value = ref(45)

const id = useId()
const service = useMachine(
  angleSlider.machine,
  computed(() => ({
    id,
    value: value.value,
    onValueChange: (details: angleSlider.ValueChangeDetails) => (value.value = details.value),
  })),
)

const api = computed(() => angleSlider.connect(service, normalizeProps))

const onInput = (event: Event) => {
  const next = (event.currentTarget as HTMLInputElement).valueAsNumber
  value.value = Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next))
}
</script>

<template>
  <main class="angle-slider">
    <div class="angle-slider-layout">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Rotation
          <span v-bind="api.getValueTextProps()">{{ api.value }}°</span>
        </label>
        <div v-bind="api.getControlProps()">
          <div v-bind="api.getThumbProps()" />
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>

      <div class="angle-slider-presets">
        <button v-for="preset in PRESETS" :key="preset" :aria-pressed="value === preset" @click="value = preset">
          {{ preset }}°
        </button>
        <input type="number" aria-label="Rotation in degrees" min="0" max="359" :value="value" @input="onInput" />
      </div>
    </div>
  </main>
</template>
