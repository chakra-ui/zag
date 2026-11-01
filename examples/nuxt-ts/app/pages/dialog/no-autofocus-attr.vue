<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Open dialog</button>
    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <button v-bind="api.getCloseTriggerProps()" data-no-autofocus>
            <XIcon />
          </button>
          <button data-no-autofocus aria-label="Help">?</button>
          <h2 v-bind="api.getTitleProps()">Delete item?</h2>
          <p v-bind="api.getDescriptionProps()">Close and help are skipped. Cancel receives focus.</p>
          <button>Cancel</button>
          <button>Delete</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
