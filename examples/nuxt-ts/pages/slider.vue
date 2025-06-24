<script setup lang="ts">
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
      <div v-bind="api.getRootProps()">
        <div>
          <label data-testid="label" v-bind="api.getLabelProps()"> Slider Label </label>
          <output data-testid="output" v-bind="api.getValueTextProps()"> {{ api.value.at(0) }} </output>
        </div>
        <div class="control-area">
          <div v-bind="api.getControlProps()">
            <div data-testid="track" v-bind="api.getTrackProps()">
              <div v-bind="api.getRangeProps()" />
            </div>
            <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
              <input v-bind="api.getHiddenInputProps({ index })" />
            </div>
          </div>
          <div v-bind="api.getMarkerGroupProps()">
            <span v-bind="api.getMarkerProps({ value: 10 })">*</span>
            <span v-bind="api.getMarkerProps({ value: 30 })">*</span>
            <span v-bind="api.getMarkerProps({ value: 90 })">*</span>
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
