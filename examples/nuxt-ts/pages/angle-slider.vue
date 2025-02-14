<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { angleSliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(angleSliderControls)

const service = useMachine(angleSlider.machine, { id: useId() })

const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">
        Angle Slider:
        <div v-bind="api.getValueTextProps()">{{ api.valueAsDegree }}</div>
      </label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getThumbProps()"></div>
        <div v-bind="api.getMarkerGroupProps()">
          <div
            v-for="value in [0, 45, 90, 135, 180, 225, 270, 315]"
            :key="value"
            v-bind="api.getMarkerProps({ value })"
          ></div>
        </div>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
