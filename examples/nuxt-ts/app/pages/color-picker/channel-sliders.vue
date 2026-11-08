<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const sliders = [
  { channel: "hue", label: "Hue" },
  { channel: "alpha", label: "Alpha" },
] as const

const controls = useControls(colorPickerControls)

const service = useMachine(
  colorPicker.machine,
  controls.mergeProps<colorPicker.Props>({
    id: useId(),
    name: "color",
    defaultValue: colorPicker.parse("hsla(210, 90%, 55%, 0.8)"),
    inline: true,
  }),
)

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getContentProps()" class="channel-sliders">
        <div class="channel-sliders__preview">
          <div class="channel-sliders__swatch">
            <div v-bind="api.getTransparencyGridProps({ size: '8px' })" />
            <div v-bind="api.getSwatchProps({ value: api.value })" />
          </div>
          <div class="channel-sliders__value">
            <span v-bind="api.getValueTextProps()">{{ api.valueAsString }}</span>
            <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
          </div>
        </div>

        <div v-for="{ channel, label } in sliders" :key="channel" class="channel-sliders__field">
          <div class="channel-sliders__header">
            <label v-bind="api.getChannelSliderLabelProps({ channel })">{{ label }}</label>
            <span v-bind="api.getChannelSliderValueTextProps({ channel })">
              {{ api.value.toFormat("hsla").formatChannelValue(channel, "en-US") }}
            </span>
          </div>
          <div v-bind="api.getChannelSliderProps({ channel })">
            <div v-if="channel === 'alpha'" v-bind="api.getTransparencyGridProps({ size: '10px' })" />
            <div v-bind="api.getChannelSliderTrackProps({ channel })" />
            <div v-bind="api.getChannelSliderThumbProps({ channel })" />
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
