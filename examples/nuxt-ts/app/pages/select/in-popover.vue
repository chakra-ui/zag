<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/select.css"
import "@styles/popover.css"

const service = useMachine(popover.machine, {
  id: useId(),
  modal: false,
})
const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 20px">
    <button v-bind="api.getTriggerProps()">Open Popover</button>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getTitleProps()">Select in Popover</div>
          <div>
            <SelectOverlayCountry />
          </div>
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
