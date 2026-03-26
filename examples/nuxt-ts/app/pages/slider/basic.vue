<script setup lang="ts">
import styles from "../../../../../shared/src/css/slider.module.css"
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(sliderControls)

const service = useMachine(
  slider.machine,
  controls.mergeProps<slider.Props>({
    id: useId(),
    name: "quantity",
    defaultValue: [0],
  }),
)

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main class="slider">
    <form
      @input="
        (e) => {
          const target = e.currentTarget
          const formData = serialize(target as any, { hash: true })
          console.log(formData)
        }
      "
    >
      <div v-bind="api.getRootProps()" :class="styles.Root">
        <div>
          <label data-testid="label" v-bind="api.getLabelProps()"> Slider Label </label>
          <output data-testid="output" v-bind="api.getValueTextProps()" :class="styles.ValueText"> {{ api.value.at(0) }} </output>
        </div>
        <div class="control-area">
          <div v-bind="api.getControlProps()" :class="styles.Control">
            <div data-testid="track" v-bind="api.getTrackProps()" :class="styles.Track">
              <div v-bind="api.getRangeProps()" :class="styles.Range" />
            </div>
            <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })" :class="styles.Thumb">
              <input v-bind="api.getHiddenInputProps({ index })" />
            </div>
          </div>
          <div v-bind="api.getMarkerGroupProps()" :class="styles.MarkerGroup">
            <span v-bind="api.getMarkerProps({ value: 10 })" :class="styles.Marker">*</span>
            <span v-bind="api.getMarkerProps({ value: 30 })" :class="styles.Marker">*</span>
            <span v-bind="api.getMarkerProps({ value: 90 })" :class="styles.Marker">*</span>
          </div>
        </div>
      </div>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
