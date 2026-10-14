<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">Open Dialog</button>
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
        <button v-bind="api.getCloseTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
  </Teleport>
</template>
