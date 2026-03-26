<script setup lang="ts">
import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, useId } from "vue"

const service = useMachine(scrollArea.machine, { id: useId() })
const api = computed(() => scrollArea.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="{ ...$attrs, ...api.getRootProps() }">
    <div v-bind="api.getViewportProps()">
      <div v-bind="api.getContentProps()">
        <slot />
      </div>
    </div>
    <div v-if="api.hasOverflowY" v-bind="api.getScrollbarProps()">
      <div v-bind="api.getThumbProps()" />
    </div>
  </div>
</template>
