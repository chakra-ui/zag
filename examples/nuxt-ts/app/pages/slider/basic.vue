<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const controls = useControls(sliderControls)

const service = useMachine(
  slider.machine,
  controls.mergeProps<slider.Props>({
    id: useId(),
    name: "volume",
    defaultValue: [0],
    thumbSize: 20,
  }),
)

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Volume</label>
      <output v-bind="api.getValueTextProps()">{{ api.value.join("") }}</output>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getTrackProps()">
          <div v-bind="api.getRangeProps()" />
        </div>
        <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
          <input v-bind="api.getHiddenInputProps({ index })" />
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
