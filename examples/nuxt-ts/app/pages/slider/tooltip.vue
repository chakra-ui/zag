<script setup lang="ts">
import * as slider from "@zag-js/slider"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"
import "@styles/tooltip.css"

const sliderService = useMachine(slider.machine, {
  id: useId(),
  name: "opacity",
  defaultValue: [60],
  thumbSize: 20,
})

const sliderApi = computed(() => slider.connect(sliderService, normalizeProps))

const tooltipId = useId()
const tooltipService = useMachine(
  tooltip.machine,
  computed(() => ({
    id: tooltipId,
    open: sliderApi.value.focused || sliderApi.value.dragging,
    positioning: { placement: "top" as const },
  })),
)

const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="sliderApi.getRootProps()">
      <label v-bind="sliderApi.getLabelProps()">Opacity</label>
      <div v-bind="sliderApi.getControlProps()">
        <div v-bind="sliderApi.getTrackProps()">
          <div v-bind="sliderApi.getRangeProps()" />
        </div>
        <div v-bind="mergeProps(tooltipApi.getTriggerProps(), sliderApi.getThumbProps({ index: 0 }))">
          <input v-bind="sliderApi.getHiddenInputProps({ index: 0 })" />
        </div>
      </div>
    </div>
    <Teleport v-if="tooltipApi.open" to="#teleports">
      <div v-bind="tooltipApi.getPositionerProps()">
        <div v-bind="tooltipApi.getContentProps()">{{ sliderApi.value[0] }}%</div>
      </div>
    </Teleport>
  </main>
</template>
