<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"
import "@styles/dialog.css"

const triggerRef = ref<HTMLButtonElement | null>(null)

const menuService = useMachine(menu.machine, {
  id: useId(),
  onSelect({ value }) {
    if (value === "delete") dialogApi.value.setOpen(true)
  },
})
const menuApi = computed(() => menu.connect(menuService, normalizeProps))

const dialogService = useMachine(dialog.machine, {
  id: useId(),
  role: "alertdialog",
  // Back to the trigger, since the item that opened the dialog is gone
  finalFocusEl: () => triggerRef.value,
})
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))
</script>

<template>
  <main>
    <button ref="triggerRef" v-bind="menuApi.getTriggerProps()">
      Actions <span v-bind="menuApi.getIndicatorProps()">▾</span>
    </button>
    <Teleport to="#teleports">
      <div v-bind="menuApi.getPositionerProps()">
        <ul v-bind="menuApi.getContentProps()">
          <li v-bind="menuApi.getItemProps({ value: 'edit' })">Edit</li>
          <li v-bind="menuApi.getItemProps({ value: 'duplicate' })">Duplicate</li>
          <li v-bind="menuApi.getItemProps({ value: 'delete' })">Delete…</li>
        </ul>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <Presence v-bind="dialogApi.getBackdropProps()" />
      <div v-bind="dialogApi.getPositionerProps()">
        <Presence v-bind="dialogApi.getContentProps()">
          <h2 v-bind="dialogApi.getTitleProps()">Delete project?</h2>
          <p v-bind="dialogApi.getDescriptionProps()">This can't be undone.</p>
          <button v-bind="dialogApi.getCloseTriggerProps()">Cancel</button>
          <button @click="dialogApi.setOpen(false)">Delete</button>
        </Presence>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="menuService" />
  </Toolbar>
</template>
