<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card.css"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: useId(), initialFocusEl: null })
const api = computed(() => dialog.connect(service, normalizeProps))
const contentRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <div style="padding: 20px">
    <button v-bind="api.getTriggerProps()" data-testid="trigger-1">Open Dialog</button>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div data-testid="positioner-1" v-bind="api.getPositionerProps()">
        <div
          ref="contentRef"
          v-bind="mergeProps(api.getContentProps(), { style: { width: '400px', height: '400px' } })"
        >
          <HoverCardInDialogCard :container="contentRef" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
