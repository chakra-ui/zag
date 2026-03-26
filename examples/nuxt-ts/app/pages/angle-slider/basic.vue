<script setup lang="ts">
import styles from "../../../../../shared/src/css/angle-slider.module.css"
import * as angleSlider from "@zag-js/angle-slider"
import { angleSliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(angleSliderControls)

const service = useMachine(
  angleSlider.machine,
  controls.mergeProps<angleSlider.Props>({
    id: useId(),
  }),
)

const api = computed(() => angleSlider.connect(service, normalizeProps))
</script>

<template>
  <main class="angle-slider">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <label v-bind="api.getLabelProps()" :class="styles.Label">
        Angle Slider:
        <div v-bind="api.getValueTextProps()">{{ api.valueAsDegree }}</div>
      </label>
      <div v-bind="api.getControlProps()" :class="styles.Control">
        <div v-bind="api.getThumbProps()" :class="styles.Thumb"></div>
        <div v-bind="api.getMarkerGroupProps()" :class="styles.MarkerGroup">
          <div
            v-for="value in [0, 45, 90, 135, 180, 225, 270, 315]"
            :key="value"
            v-bind="api.getMarkerProps({ value })" :class="styles.Marker"
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
