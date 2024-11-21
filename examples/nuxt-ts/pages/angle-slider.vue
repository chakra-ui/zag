<script setup lang="ts">
import * as angleSlider from "@zag-js/angle-slider"
import { angleSliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(angleSliderControls)

const [state, send] = useMachine(angleSlider.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => angleSlider.connect(state.value, send, normalizeProps))
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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
