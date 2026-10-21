<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(dialog.machine, { id: useId(), modal: false, closeOnInteractOutside: true })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button data-testid="trigger-1" v-bind="api.getTriggerProps()">Open Dialog</button>
    <input data-testid="outside-input" placeholder="Outside input" />
    <p data-testid="outside-content">The page stays interactive while the dialog is open.</p>

    <Teleport v-if="api.open" to="#teleports">
      <div data-testid="positioner-1" v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Non-modal dialog</h2>
          <p v-bind="api.getDescriptionProps()">No backdrop and no focus trap.</p>
          <input placeholder="Enter name..." />
          <button data-testid="close-1" v-bind="api.getCloseTriggerProps()">Close</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
