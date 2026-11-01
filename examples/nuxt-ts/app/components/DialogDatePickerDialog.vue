<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">Open</button>
  <Teleport v-if="api.open" to="body">
    <div v-bind="api.getBackdropProps()" />
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <slot />
        <button v-bind="api.getCloseTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
  </Teleport>
</template>
