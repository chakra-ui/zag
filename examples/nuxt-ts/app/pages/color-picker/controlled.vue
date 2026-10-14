<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const presets = ["#f47373", "#697689"]

const open = ref(false)

const id = useId()
const service = useMachine(
  colorPicker.machine,
  computed(() => ({
    id,
    name: "color",
    defaultFormat: "hsla",
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
    open: open.value,
    onOpenChange: (details) => {
      open.value = details.open
    },
  })),
)

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>Color Picker Controlled</h1>
    <h1>{{ String(open) }}</h1>

    <div style="display: flex; gap: 12px; margin-bottom: 24px">
      <button type="button" @click="open = true">Open</button>
      <button type="button" @click="open = false">Close</button>
    </div>

    <main class="color-picker">
      <input v-bind="api.getHiddenInputProps()" />
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Select Color: <span data-testid="value-text">{{ api.valueAsString }}</span>
        </label>

        <div v-bind="api.getControlProps()">
          <button v-bind="api.getTriggerProps()">
            <div v-bind="api.getTransparencyGridProps({ size: '10px' })" />
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
                <div v-bind="api.getTransparencyGridProps({ size: '12px' })" />
                <div v-bind="api.getChannelSliderTrackProps({ channel: 'alpha' })" />
                <div v-bind="api.getChannelSliderThumbProps({ channel: 'alpha' })" />
              </div>

              <div v-if="api.format.startsWith('hsl')" style="display: flex; width: 100%">
                <span>H</span> <input v-bind="api.getChannelInputProps({ channel: 'hue' })" /> <span>S</span>
                <input v-bind="api.getChannelInputProps({ channel: 'saturation' })" /> <span>L</span>
                <input v-bind="api.getChannelInputProps({ channel: 'lightness' })" /> <span>A</span>
                <input v-bind="api.getChannelInputProps({ channel: 'alpha' })" />
              </div>

              <div v-if="api.format.startsWith('rgb')" style="display: flex; width: 100%">
                <span>R</span> <input v-bind="api.getChannelInputProps({ channel: 'red' })" /> <span>G</span>
                <input v-bind="api.getChannelInputProps({ channel: 'green' })" /> <span>B</span>
                <input v-bind="api.getChannelInputProps({ channel: 'blue' })" /> <span>A</span>
                <input v-bind="api.getChannelInputProps({ channel: 'alpha' })" />
              </div>

              <div v-if="api.format.startsWith('hsb')" style="display: flex; width: 100%">
                <span>H</span> <input v-bind="api.getChannelInputProps({ channel: 'hue' })" /> <span>S</span>
                <input v-bind="api.getChannelInputProps({ channel: 'saturation' })" /> <span>B</span>
                <input v-bind="api.getChannelInputProps({ channel: 'brightness' })" /> <span>A</span>
                <input v-bind="api.getChannelInputProps({ channel: 'alpha' })" />
              </div>

              <div style="display: flex; gap: 10px; align-items: center">
                <div style="position: relative">
                  <div v-bind="api.getTransparencyGridProps({ size: '4px' })" />
                  <div v-bind="api.getSwatchProps({ value: api.value })" />
                </div>
                <p data-testid="value-text">{{ api.valueAsString }}</p>
              </div>

              <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />

              <div v-bind="api.getSwatchGroupProps()" style="display: flex; gap: 10px">
                <button v-for="preset in presets" :key="preset" v-bind="api.getSwatchTriggerProps({ value: preset })">
                  <div style="position: relative">
                    <div v-bind="api.getTransparencyGridProps({ size: '4px' })" />
                    <div v-bind="api.getSwatchProps({ value: preset })" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
