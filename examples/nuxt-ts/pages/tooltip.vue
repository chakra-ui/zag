<script setup>
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, Teleport } from "vue"

const service = useMachine(tooltip.machine, {
  id: useId(),
  positioning: { sameWidth: true },
})

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px">
    <button v-bind="api.getTriggerProps()">Hover me</button>
    <Teleport to="#teleports">
      <div v-if="api.open" v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">Tooltip</div>
      </div>
    </Teleport>
  </div>
</template>
