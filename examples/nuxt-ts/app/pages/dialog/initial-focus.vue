<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const inputRef = ref<HTMLInputElement | null>(null)

const service = useMachine(dialog.machine, {
  id: useId(),
  initialFocusEl: () => inputRef.value,
})
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Open dialog</button>
    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
          <h2 v-bind="api.getTitleProps()">Edit profile</h2>
          <p v-bind="api.getDescriptionProps()">The name input receives focus via initialFocusEl.</p>
          <input ref="inputRef" placeholder="Enter name..." />
          <button>Save</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
