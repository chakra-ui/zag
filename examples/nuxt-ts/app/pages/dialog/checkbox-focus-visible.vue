<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

// Clicking a control with the mouse inside a focus-trapped overlay must not set data-focus-visible
// when focus moves from another control in the same overlay.

const dialogService = useMachine(dialog.machine, { id: useId() })
const dlg = computed(() => dialog.connect(dialogService, normalizeProps))

const popoverService = useMachine(popover.machine, { id: useId() })
const pop = computed(() => popover.connect(popoverService, normalizeProps))

const focusCss = `
  [data-checkbox-root], [data-switch-root], [data-radio-group-item] { padding: 5px; border-radius: 6px; }
  [data-focus-visible] { outline: 3px solid crimson; outline-offset: 2px; background: #ffe9ec; }
`
</script>

<template>
  <main style="padding: 40px; font-family: system-ui">
    <component :is="'style'">{{ focusCss }}</component>
    <h1 style="font-size: 20px; margin-bottom: 16px">focus-visible inside focus traps</h1>

    <section style="margin-bottom: 20px">
      <h2 style="font-size: 14px">Control — no focus trap</h2>
      <DialogFocusCheckbox label="First" test-id="out-a" />
      <DialogFocusCheckbox label="Second" test-id="out-b" />
    </section>

    <div style="display: flex; gap: 12px">
      <button v-bind="dlg.getTriggerProps()">Open dialog</button>
      <button v-bind="pop.getTriggerProps()" data-testid="popover-trigger">Open popover</button>
    </div>

    <Teleport v-if="dlg.open" to="body">
      <div v-bind="dlg.getBackdropProps()" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4)" />
      <div v-bind="dlg.getPositionerProps()" style="position: fixed; inset: 0; display: grid; place-items: center">
        <div
          v-bind="dlg.getContentProps()"
          style="background: #fff; padding: 24px; border-radius: 8px; min-width: 320px"
        >
          <h2 v-bind="dlg.getTitleProps()" style="font-size: 15px">Dialog</h2>
          <div style="display: grid; gap: 8px; margin: 12px 0">
            <DialogFocusCheckbox label="First" test-id="dlg-cb-a" />
            <DialogFocusCheckbox label="Second" test-id="dlg-cb-b" />
            <DialogFocusSwitch label="Switch A" test-id="dlg-sw-a" />
            <DialogFocusSwitch label="Switch B" test-id="dlg-sw-b" />
            <DialogFocusRadioGroup test-id="dlg-radio" />
          </div>
          <button v-bind="dlg.getCloseTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>

    <div v-bind="pop.getPositionerProps()">
      <div v-bind="pop.getContentProps()" style="background: #fff; border: 1px solid #ccc; padding: 16px">
        <div style="display: grid; gap: 8px">
          <DialogFocusCheckbox label="First" test-id="pop-cb-a" />
          <DialogFocusCheckbox label="Second" test-id="pop-cb-b" />
        </div>
      </div>
    </div>
  </main>
</template>
