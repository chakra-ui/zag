<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(tooltip.machine, { id: useId() })
const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">Hover me</button>
  <Teleport v-if="api.open" to="#teleports">
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">Tooltip</div>
    </div>
  </Teleport>
</template>
