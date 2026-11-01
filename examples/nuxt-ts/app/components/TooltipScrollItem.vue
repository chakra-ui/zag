<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ closeOnPointerDown?: boolean }>()

const service = useMachine(tooltip.machine, {
  id: useId(),
  positioning: { placement: "right" },
  openDelay: 100,
  closeDelay: 100,
  closeOnPointerDown: props.closeOnPointerDown,
})

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()"><slot /></button>
  <Teleport to="#teleports">
    <div v-if="api.open" v-bind="api.getPositionerProps()">
      <div class="tooltip-content" v-bind="api.getContentProps()">
        <div v-bind="api.getArrowProps()">
          <div v-bind="api.getArrowTipProps()" />
        </div>
        Tooltip
      </div>
    </div>
  </Teleport>
</template>
