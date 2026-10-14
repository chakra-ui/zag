<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/vue"

defineProps<{ label: string; size: string }>()

const service = useMachine(rating.machine, {
  id: useId(),
  defaultValue: 3,
})

const api = computed(() => rating.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()" :style="{ '--rating-size': size }">
    <label v-bind="api.getLabelProps()">{{ label }}</label>
    <div v-bind="api.getControlProps()">
      <span v-for="index in api.items" :key="index" v-bind="api.getItemProps({ index })">
        <Star />
      </span>
    </div>
    <input v-bind="api.getHiddenInputProps()" />
  </div>
</template>
