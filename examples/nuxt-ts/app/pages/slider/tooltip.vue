<script setup lang="ts">
import * as slider from "@zag-js/slider"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"
import "@styles/tooltip.css"

const sliderService = useMachine(slider.machine, {
  id: useId(),
  name: "quantity",
  thumbSize: 20,
  ids: {
    thumb(index) {
      return `thumb-${index}`
    },
  },
})

const sliderApi = computed(() => slider.connect(sliderService, normalizeProps))

const tooltipId = useId()
const tooltipService = useMachine(
  tooltip.machine,
  computed(() => ({
    id: tooltipId,
    ids: { trigger: "thumb-0" },
    open: sliderApi.value.dragging,
  })),
)

const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
</script>

<template>
  <main class="slider">
    <div v-bind="sliderApi.getRootProps()">
      <div v-bind="sliderApi.getControlProps()">
        <div v-bind="sliderApi.getTrackProps()">
          <div v-bind="sliderApi.getRangeProps()" />
        </div>
        <div v-bind="mergeProps(tooltipApi.getTriggerProps(), sliderApi.getThumbProps({ index: 0 }))" />
        <Teleport v-if="tooltipApi.open" to="#teleports">
          <div v-bind="tooltipApi.getPositionerProps()">
            <div v-bind="tooltipApi.getContentProps()">{{ sliderApi.value[0] }}</div>
          </div>
        </Teleport>
      </div>
    </div>
  </main>
</template>
