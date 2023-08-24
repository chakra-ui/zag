<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(sliderControls)

const [state, send] = useMachine(
  slider.machine({
    id: "1",
    name: "quantity",
  }),
  { context: controls.context },
)

const api = computed(() => slider.connect(state.value, send, normalizeProps))
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
      <div v-bind="api.rootProps">
        <div>
          <label data-testid="label" v-bind="api.labelProps"> Slider Label </label>
          <output data-testid="output" v-bind="api.outputProps"> {api.value} </output>
        </div>
        <div class="control-area">
          <div v-bind="api.controlProps">
            <div data-testid="track" v-bind="api.trackProps">
              <div v-bind="api.rangeProps" />
            </div>
            <div data-testid="thumb" v-bind="api.thumbProps">
              <input v-bind="api.hiddenInputProps" />
            </div>
          </div>
          <div v-bind="api.markerGroupProps">
            <span v-bind="api.getMarkerProps({ value: 10 })">*</span>
            <span v-bind="api.getMarkerProps({ value: 30 })">*</span>
            <span v-bind="api.getMarkerProps({ value: 90 })">*</span>
          </div>
        </div>
      </div>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
