<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import "@styles/slider.css"

const controls = useControls(sliderControls)

const service = useMachine(
  slider.machine,
  controls.mergeProps<slider.Props>({
    thumbSize: 20,
    id: useId(),
    name: "quantity",
    defaultValue: [10, 60],
  }),
)

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main class="slider">
    <!-- ensure we can read the value within forms -->
    <form
      @change="
        (e) => {
          const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
          console.log(formData)
        }
      "
    >
      <div v-bind="api.getRootProps()">
        <div>
          <label v-bind="api.getLabelProps()">Quantity:</label>
          <output v-bind="api.getValueTextProps()">{{ api.value.join(" - ") }}</output>
        </div>
        <div class="control-area">
          <div v-bind="api.getControlProps()">
            <div v-bind="api.getTrackProps()">
              <div v-bind="api.getRangeProps()" />
            </div>
            <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
              <input v-bind="api.getHiddenInputProps({ index })" />
            </div>
          </div>
          <div v-bind="api.getMarkerGroupProps()">
            <span v-bind="api.getMarkerProps({ value: 10 })">*</span>
            <span v-bind="api.getMarkerProps({ value: 30 })">*</span>
            <span v-bind="api.getMarkerProps({ value: 50 })">*</span>
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
