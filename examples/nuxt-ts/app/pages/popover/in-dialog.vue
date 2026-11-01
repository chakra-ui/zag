<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/popover.css"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 20px">
    <button v-bind="api.getTriggerProps()" data-testid="dialog-trigger">Open Dialog with Nested Popovers</button>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div data-testid="dialog-positioner" v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Dialog with Nested Popovers</h2>
          <p v-bind="api.getDescriptionProps()">
            This dialog contains multiple nested popovers. The focus trap should include all popover levels, even though
            they are portalled.
          </p>
          <div style="margin-top: 20px">
            <PopoverInDialogNested />
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end">
            <button v-bind="api.getCloseTriggerProps()" data-testid="dialog-close">Close Dialog</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
