<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Open dialog</button>

    <Presence v-bind="api.getBackdropProps()" />
    <div v-bind="api.getPositionerProps()">
      <Presence v-bind="api.getContentProps()">
        <button v-bind="api.getCloseTriggerProps()" data-no-autofocus>Close</button>
        <button data-no-autofocus aria-label="Help">?</button>
        <h2 v-bind="api.getTitleProps()">Delete item?</h2>
        <p v-bind="api.getDescriptionProps()">Close and help are skipped. Cancel receives focus.</p>
        <button>Cancel</button>
        <button>Delete</button>
      </Presence>
    </div>
  </main>
</template>
