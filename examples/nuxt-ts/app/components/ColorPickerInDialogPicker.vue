<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(colorPicker.machine, {
  id: useId(),
  name: "color",
  defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
})

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">Select Color</label>
    <div v-bind="api.getControlProps()">
      <input v-bind="api.getHiddenInputProps()" />
      <button v-bind="api.getTriggerProps()">
        <div style="position: relative">
          <div v-bind="api.getTransparencyGridProps({ size: '4px' })" />
          <div v-bind="api.getSwatchProps({ value: api.value })" />
        </div>
      </button>
    </div>

    <Teleport v-if="api.open" to="body">
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
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
