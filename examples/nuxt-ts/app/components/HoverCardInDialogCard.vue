<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

defineProps<{ container: HTMLElement | null | undefined }>()

const service = useMachine(hoverCard.machine, { id: useId() })
const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" v-bind="api.getTriggerProps()">Twitter</a>
  <Teleport v-if="api.open && container" :to="container">
    <div v-bind="api.getPositionerProps()">
      <div v-bind="mergeProps(api.getContentProps(), { style: { width: '200px', height: '200px' } })">
        <div v-bind="api.getArrowProps()">
          <div v-bind="api.getArrowTipProps()" />
        </div>
        Twitter Preview
        <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">Twitter</a>
      </div>
    </div>
  </Teleport>
</template>
