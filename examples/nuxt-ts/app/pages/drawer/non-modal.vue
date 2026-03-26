<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import styles from "../../../../shared/styles/drawer.module.css"

const service = useMachine(drawer.machine, {
  id: useId(),
  modal: false,
  closeOnInteractOutside: false,
  swipeDirection: "end",
})

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main style="padding: 24px">
    <button v-bind="api.getTriggerProps()" :class="styles.trigger">Open Drawer</button>

    <div style="margin-top: 24px; padding: 16px; border: 1px dashed #d1d5db; border-radius: 8px">
      <p style="color: #6b7280; font-size: 14px">
        This area stays interactive while the drawer is open. Try typing below:
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

    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getTitleProps()">Non-modal Drawer</div>
        <p v-bind="api.getDescriptionProps()" style="color: #6b7280; margin: 8px 0 0; padding: 0 16px">
          No backdrop, no focus trap, no scroll lock. The page behind stays fully interactive. Close with the button,
          drag to dismiss, or Escape.
        </p>
        <div style="padding: 16px">
          <button v-bind="api.getCloseTriggerProps()">Close</button>
        </div>
      </Presence>
    </div>
  </main>
</template>
