<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/popover.css"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, {
  id: useId(),
  // Prevent the dialog from closing when a sibling layer (toggle-tip) is removed
  onRequestDismiss(event) {
    event.preventDefault()
  },
})

const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div style="padding: 20px; display: flex; flex-direction: row; gap: 12px; align-items: center">
      <PopoverSiblingToggleTip />
      <button data-testid="dialog-trigger" v-bind="api.getTriggerProps()">Open Dialog</button>
    </div>

    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Dialog Title</h2>
          <div v-bind="api.getDescriptionProps()">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end">
            <button v-bind="api.getCloseTriggerProps()" data-testid="dialog-close">Cancel</button>
            <button data-testid="dialog-save">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>
