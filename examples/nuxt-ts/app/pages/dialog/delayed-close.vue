<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const open = ref(false)

const service = useMachine(
  dialog.machine,
  computed(() => ({
    id: "1",
    open: open.value,
    onOpenChange(details) {
      open.value = details.open
    },
  })),
)

const api = computed(() => dialog.connect(service, normalizeProps))

function delayedClose() {
  setTimeout(() => {
    api.value.setOpen(false)
  }, 2000)
}
</script>

<template>
  <main>
    <button @click="open = !open">Delayed open</button>
    <p>state - isOpen: {{ String(open) }}</p>
    <p>machine - isOpen: {{ String(api.open) }}</p>
    <Teleport to="#teleports">
      <Presence v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Edit profile</h2>
          <p v-bind="api.getDescriptionProps()">Make changes to your profile here. Click save when you are done.</p>
          <button @click="delayedClose">Delayed close</button>
          <button v-bind="api.getCloseTriggerProps()">Close</button>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
