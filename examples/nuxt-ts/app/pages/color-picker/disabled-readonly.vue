<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const errorId = "color-error"
const invalid = ref(true)

const disabledService = useMachine(colorPicker.machine, {
  id: useId(),
  disabled: true,
  defaultValue: colorPicker.parse("#3b82f6"),
})

const readOnlyService = useMachine(colorPicker.machine, {
  id: useId(),
  readOnly: true,
  defaultValue: colorPicker.parse("#22c55e"),
})

const invalidId = useId()
const invalidService = useMachine(
  colorPicker.machine,
  computed(() => ({
    id: invalidId,
    invalid: invalid.value,
    defaultValue: colorPicker.parse("#eab308"),
  })),
)

const pickers = computed(() => [
  { label: "Disabled", api: colorPicker.connect(disabledService, normalizeProps) },
  { label: "Read-only", api: colorPicker.connect(readOnlyService, normalizeProps) },
  { label: "Invalid", api: colorPicker.connect(invalidService, normalizeProps) },
])
</script>

<template>
  <main class="color-picker">
    <div class="color-picker-row">
      <div v-for="{ label, api } in pickers" :key="label" v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">{{ label }}</label>

        <div v-bind="api.getControlProps()">
          <button v-bind="api.getTriggerProps()">
            <div v-bind="api.getTransparencyGridProps({ size: '10px' })" />
            <div v-bind="api.getSwatchProps({ value: api.value })" />
          </button>
          <input
            v-bind="api.getChannelInputProps({ channel: 'hex' })"
            :aria-describedby="api.getRootState().invalid ? errorId : undefined"
          />
        </div>

        <p v-if="api.getRootState().invalid" :id="errorId" class="color-picker-error">
          Pick a color with enough contrast
        </p>

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
            </div>
          </div>
        </div>
      </div>
    </div>

    <label><input v-model="invalid" type="checkbox" /> Mark as invalid</label>
  </main>
</template>
