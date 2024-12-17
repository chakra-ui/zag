<script setup>
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, Teleport } from "vue"

const [state, send] = useMachine(
  tooltip.machine({
    id: "1",
    positioning: {
      sameWidth: true,
    },
    closeDelay: 60000,
  }),
)
const api = computed(() => tooltip.connect(state.value, send, normalizeProps))
</script>

<template>
  <div style="padding: 40px">
    <pre>{{ state.value }}</pre>
    <button ref="ref" v-bind="api.getTriggerProps()">Hover me</button>
    <Teleport to="body">
      <div v-if="api.open" v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">Tooltip with a lot of text probably</div>
      </div>
    </Teleport>
  </div>
</template>
