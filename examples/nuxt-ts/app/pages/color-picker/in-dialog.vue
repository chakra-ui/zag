<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/color-picker.css"
import "@styles/dialog.css"

const title = "Primary Color Selection"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main style="padding: 20px">
    <h1>Color Picker in Dialog Test</h1>
    <p>
      This page tests the portalled color picker inside a portalled dialog issue. Before the fix, clicking on the color
      picker would close the dialog.
    </p>

    <div style="margin-top: 20px">
      <button v-bind="api.getTriggerProps()">Open Dialog</button>
      <Teleport v-if="api.open" to="body">
        <div v-bind="api.getBackdropProps()" />
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div style="padding: 24px; min-width: 400px">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
                <h2 v-bind="api.getTitleProps()">{{ title }}</h2>
                <button v-bind="api.getCloseTriggerProps()">
                  <XIcon />
                </button>
              </div>
              <div v-bind="api.getDescriptionProps()" style="margin-bottom: 24px">
                This dialog contains a color picker. The issue was that interacting with the color picker would close
                the dialog.
              </div>
              <div style="margin-bottom: 16px">
                <ColorPickerInDialogPicker />
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>
