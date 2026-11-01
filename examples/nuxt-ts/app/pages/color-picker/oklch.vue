<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import "@styles/color-picker.css"

const presets = ["#f47373", "oklch(0.7 0.2 200)", "#9f7aea"]

const controls = useControls(colorPickerControls)

const service = useMachine(
  colorPicker.machine,
  controls.mergeProps<colorPicker.Props>({
    id: useId(),
    name: "color",
    format: "oklch",
    defaultValue: colorPicker.parse("oklch(0.65 0.15 250)"),
  }),
)

const api = computed(() => colorPicker.connect(service, normalizeProps))
const gamutOverlay = computed(() => api.value.getGamutOverlay())

const onFormChange = (e: Event) => {
  console.log("change:", serialize(e.currentTarget as HTMLFormElement, { hash: true }))
}
</script>

<template>
  <main class="color-picker">
    <form @change="onFormChange">
      <input v-bind="api.getHiddenInputProps()" />
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          OKLCH (wide gamut): <span data-testid="value-text">{{ api.valueAsString }}</span>
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
                <svg v-if="gamutOverlay" v-bind="api.getGamutOverlayProps()">
                  <path
                    :d="gamutOverlay.path"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    stroke-width="1.5"
                    vector-effect="non-scaling-stroke"
                  />
                  <text
                    :x="gamutOverlay.labelPosition.x"
                    :y="gamutOverlay.labelPosition.y"
                    fill="rgba(255,255,255,0.7)"
                    font-size="6"
                    font-family="system-ui, sans-serif"
                    text-anchor="end"
                  >
                    sRGB
                  </text>
                </svg>
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

              <div v-if="api.format === 'oklch'" style="display: flex; width: 100%; flex-wrap: wrap; gap: 6px">
                <span>L</span> <input v-bind="api.getChannelInputProps({ channel: 'lightness' })" /> <span>C</span>
                <input v-bind="api.getChannelInputProps({ channel: 'chroma' })" /> <span>H</span>
                <input v-bind="api.getChannelInputProps({ channel: 'hue' })" /> <span>A</span>
                <input v-bind="api.getChannelInputProps({ channel: 'alpha' })" />
              </div>

              <p data-testid="value-text">{{ api.valueAsString }}</p>

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
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
