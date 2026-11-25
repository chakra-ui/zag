<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(dialog.machine, { id: useId() })

const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()" data-testid="trigger-1">Open dialog</button>
    <Presence v-bind="api.getBackdropProps()" lazy-mount unmount-on-exit />
    <Presence
      v-bind="api.getPositionerProps()"
      :hidden="!api.open"
      lazy-mount
      unmount-on-exit
      data-testid="positioner-1"
    >
      <div v-bind="api.getContentProps()">
        <h2 v-bind="api.getTitleProps()">Edit profile</h2>
        <p v-bind="api.getDescriptionProps()">Make changes to your profile here. Click save when you are done.</p>
        <input placeholder="Enter name..." data-testid="input-1" />
        <button>Save</button>
        <button v-bind="api.getCloseTriggerProps()" data-testid="close-1">Close</button>
      </div>
    </Presence>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
