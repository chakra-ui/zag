<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

defineProps<{ trigger: string }>()

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">{{ trigger }}</button>
  <Teleport v-if="api.open" to="body">
    <div v-bind="api.getBackdropProps()" />
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <h2 v-bind="api.getTitleProps()">Dialog</h2>
        <p v-bind="api.getDescriptionProps()">Dialog content</p>
        <button v-bind="api.getCloseTriggerProps()">
          <XIcon />
        </button>
        <div><slot /></div>
      </div>
    </div>
  </Teleport>
</template>
