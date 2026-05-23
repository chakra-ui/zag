<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

// Dialog 1
const service = useMachine(dialog.machine, { id: useId() })
const parentDialog = computed(() => dialog.connect(service, normalizeProps))

// Dialog 2
const service2 = useMachine(dialog.machine, { id: useId() })
const childDialog = computed(() => dialog.connect(service2, normalizeProps))
</script>

<template>
  <main>
    <div>
      <button v-bind="parentDialog.getTriggerProps()" data-testid="trigger-1">Open Dialog</button>

      <div style="min-height: 1200px" />

      <Teleport v-if="parentDialog.open" to="#teleports">
        <div v-bind="parentDialog.getBackdropProps()" />
        <div data-testid="positioner-1" v-bind="parentDialog.getPositionerProps()">
          <div v-bind="parentDialog.getContentProps()">
            <h2 v-bind="parentDialog.getTitleProps()">Edit profile</h2>
            <p v-bind="parentDialog.getDescriptionProps()">
              Make changes to your profile here. Click save when you are done.
            </p>
            <button v-bind="parentDialog.getCloseTriggerProps()" data-testid="close-1">X</button>
            <input type="text" placeholder="Enter name..." data-testid="input-1" />
            <button data-testid="save-button-1">Save Changes</button>

            <button v-bind="childDialog.getTriggerProps()" data-testid="trigger-2">Open Nested</button>

            <Teleport v-if="childDialog.open" to="#teleports">
              <div v-bind="childDialog.getBackdropProps()" />
              <div data-testid="positioner-2" v-bind="childDialog.getPositionerProps()">
                <div v-bind="childDialog.getContentProps()">
                  <h2 v-bind="childDialog.getTitleProps()">Nested</h2>
                  <button v-bind="childDialog.getCloseTriggerProps()" data-testid="close-2">X</button>
                  <button data-testid="special-close" @click="parentDialog.setOpen(false)">Close Dialog 1</button>
                </div>
              </div>
            </Teleport>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer label="Dialog 1" :state="service" />
    <StateVisualizer label="Dialog 2" :state="service2" />
  </Toolbar>
</template>
