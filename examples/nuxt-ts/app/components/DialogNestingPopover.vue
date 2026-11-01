<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

defineProps<{ trigger: string }>()

const service = useMachine(popover.machine, { id: useId() })
const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">{{ trigger }}</button>
  <Teleport v-if="api.open" to="body">
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getTitleProps()">Popover</div>
        <button v-bind="api.getCloseTriggerProps()">
          <XIcon />
        </button>
        <div><slot /></div>
      </div>
    </div>
  </Teleport>
</template>
