<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{
  label: string
  props: Partial<slider.Props>
  format: (value: number) => string
  marks?: number[]
}>()

const service = useMachine(slider.machine, {
  id: useId(),
  thumbSize: 20,
  ...props.props,
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">{{ label }}</label>
    <output v-bind="api.getValueTextProps()">{{ format(api.value[0]!) }}</output>
    <div v-bind="api.getControlProps()">
      <div v-bind="api.getTrackProps()">
        <div v-bind="api.getRangeProps()" />
      </div>
      <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
        <input v-bind="api.getHiddenInputProps({ index })" />
      </div>
    </div>
    <div v-if="marks" v-bind="api.getMarkerGroupProps()">
      <span v-for="value in marks" :key="value" v-bind="api.getMarkerProps({ value })">{{
        value > 0 ? `+${value}` : value
      }}</span>
    </div>
  </div>
</template>
