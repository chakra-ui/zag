<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/select.css"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 20px">
    <button v-bind="api.getTriggerProps()" data-testid="trigger-1">Open Dialog</button>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div data-testid="positioner-1" v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Edit profile</h2>
          <p v-bind="api.getDescriptionProps()">Make changes to your profile here. Click save when you are done.</p>
          <SelectOverlayCountry />
        </div>
      </div>
    </Teleport>
  </div>
</template>
