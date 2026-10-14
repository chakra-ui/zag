<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: "1", modal: false })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main style="padding: 24px">
    <button v-bind="api.getTriggerProps()">Open non-modal dialog</button>

    <div style="margin-top: 24px; padding: 16px; border: 1px dashed #d1d5db; border-radius: 8px">
      <p style="color: #6b7280; font-size: 14px">
        This area stays interactive while the dialog is open. Try typing below:
      </p>
      <input
        type="text"
        placeholder="Type something..."
        style="
          width: 100%;
          padding: 8px 12px;
          margin-top: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 16px;
          outline: none;
          box-sizing: border-box;
        "
      />
    </div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Non-modal dialog</h2>
          <p v-bind="api.getDescriptionProps()">
            No backdrop, no focus trap, no scroll lock. The page behind stays fully interactive. Close with the button
            or Escape.
          </p>
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
