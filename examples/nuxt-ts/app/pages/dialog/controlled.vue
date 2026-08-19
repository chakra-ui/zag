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
</script>

<template>
  <div>
    <button @click="open = !open">Open Dialog</button>
    <p>state - isOpen: {{ String(open) }}</p>
    <p>machine - isOpen: {{ String(api.open) }}</p>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Edit profile</h2>
          <p v-bind="api.getDescriptionProps()">Make changes to your profile here. Click save when you are done.</p>
          <div>
            <input placeholder="Enter name..." />
            <button>Save</button>
          </div>
          <button v-bind="api.getCloseTriggerProps()">Close</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
