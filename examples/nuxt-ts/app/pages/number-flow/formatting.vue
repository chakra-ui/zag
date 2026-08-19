<script setup lang="ts">
import * as numberFlow from "@zag-js/number-flow"
import { numberFlowControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, ref, useId } from "vue"
import "@styles/number-flow.css"

const PRESETS = {
  usd: {
    label: "USD Currency (en-US)",
    locale: "en-US",
    formatOptions: { style: "currency", currency: "USD" },
    step: 100,
    defaultValue: 1234.56,
  },
  eur: {
    label: "EUR Currency (de-DE)",
    locale: "de-DE",
    formatOptions: { style: "currency", currency: "EUR" },
    step: 100,
    defaultValue: 1234.56,
  },
  percent: {
    label: "Percent (en-US)",
    locale: "en-US",
    formatOptions: { style: "percent", minimumFractionDigits: 1 },
    step: 0.05,
    defaultValue: 0.256,
  },
  arabic: {
    label: "Arabic-Indic Digits (ar-EG)",
    locale: "ar-EG",
    formatOptions: {},
    step: 100,
    defaultValue: 1234,
  },
  plain: {
    label: "Grouped Plain (en-US)",
    locale: "en-US",
    formatOptions: {},
    step: 1000,
    defaultValue: 1234567,
  },
} satisfies Record<
  string,
  { label: string; locale: string; formatOptions: Intl.NumberFormatOptions; step: number; defaultValue: number }
>

type PresetKey = keyof typeof PRESETS

const controls = useControls(numberFlowControls)
const preset = ref<PresetKey>("usd")
const value = ref(PRESETS.usd.defaultValue)

const current = computed(() => PRESETS[preset.value])

const service = useMachine(
  numberFlow.machine,
  controls.mergeProps<numberFlow.Props>({
    id: useId(),
    get value() {
      return value.value
    },
    get locale() {
      return current.value.locale
    },
    get formatOptions() {
      return current.value.formatOptions
    },
  }),
)

const api = computed(() => numberFlow.connect(service, normalizeProps))

function changePreset(next: PresetKey) {
  preset.value = next
  value.value = PRESETS[next].defaultValue
}
</script>

<template>
  <main class="number-flow">
    <div v-bind="api.getRootProps()">
      <template v-for="segment in api.segments" :key="segment.key">
        <span v-if="segment.kind === 'digit'" v-bind="api.getDigitProps({ segment })">
          <span v-bind="api.getDigitTrackProps({ segment })">
            <span v-for="cell in api.digitCells" :key="cell.index" v-bind="api.getDigitCellProps({ segment, cell })">{{
              cell.glyph
            }}</span>
          </span>
        </span>
        <span v-else v-bind="api.getSymbolProps({ segment })">{{ segment.value }}</span>
      </template>
      <span v-bind="api.getValueTextProps()">{{ api.announcedValueText }}</span>
    </div>

    <div class="number-flow__actions">
      <select
        data-testid="preset"
        :value="preset"
        @change="changePreset(($event.target as HTMLSelectElement).value as PresetKey)"
      >
        <option v-for="(item, key) in PRESETS" :key="key" :value="key">{{ item.label }}</option>
      </select>
      <button data-testid="decrease" @click="value -= current.step">-{{ current.step }}</button>
      <button data-testid="increase" @click="value += current.step">+{{ current.step }}</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
