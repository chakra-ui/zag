<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, {
  id: useId(),
  // opt out of initial focus entirely: nobody clicked, so nothing should ring
  initialFocusEl: () => false,
})
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <input data-testid="outside-input" placeholder="Focus stays here" />
    <button data-testid="open-button" @click="api.setOpen(true)">Open dialog programmatically</button>
    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
          <h2 v-bind="api.getTitleProps()">Special offer</h2>
          <p v-bind="api.getDescriptionProps()">Opened without moving focus. Tab and Escape still work.</p>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
