<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"

const open = ref(false)

const id = useId()
const service = useMachine(
  tooltip.machine,
  computed(() => ({
    id,
    open: open.value,
    onOpenChange: (details: tooltip.OpenChangeDetails) => {
      open.value = details.open
    },
    positioning: { placement: "right" as const },
  })),
)

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">Some tooltip</button>
  <Teleport v-if="api.open" to="#teleports">
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">Tooltip Content</div>
    </div>
  </Teleport>
</template>
