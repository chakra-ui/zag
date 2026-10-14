<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/select.css"
import "@styles/dialog.css"

const parentService = useMachine(dialog.machine, { id: useId() })
const parent = computed(() => dialog.connect(parentService, normalizeProps))
const childService = useMachine(dialog.machine, { id: useId() })
const child = computed(() => dialog.connect(childService, normalizeProps))
</script>

<template>
  <main>
    <h1>Select in nested dialogs</h1>
    <button v-bind="parent.getTriggerProps()" data-testid="parent-trigger">Open parent dialog</button>
    <Teleport v-if="parent.open" to="#teleports">
      <div v-bind="parent.getBackdropProps()" />
      <div v-bind="parent.getPositionerProps()">
        <div v-bind="parent.getContentProps()" data-testid="parent-content">
          <h2 v-bind="parent.getTitleProps()">Parent dialog</h2>
          <p v-bind="parent.getDescriptionProps()">Open another dialog to choose a fruit.</p>
          <button v-bind="child.getTriggerProps()" data-testid="child-trigger">Open child dialog</button>
          <Teleport v-if="child.open" to="#teleports">
            <div v-bind="child.getBackdropProps()" />
            <div v-bind="child.getPositionerProps()">
              <div v-bind="child.getContentProps()" data-testid="child-content">
                <h2 v-bind="child.getTitleProps()">Child dialog</h2>
                <p v-bind="child.getDescriptionProps()">The fruit list should appear above this dialog.</p>
                <SelectNestedDialogFruit />
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style>
[data-dialog-content][data-testid="child-content"] {
  background: #fff4ce;
  min-height: 300px;
}
[data-testid="select-positioner"][data-state="closed"] {
  animation: nestedSelectExit 0.3s ease-out;
}
@keyframes nestedSelectExit {
  to {
    opacity: 0;
  }
}
</style>
