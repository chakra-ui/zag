<script lang="ts" setup>
import styles from "../../../../../shared/src/css/dialog.module.css"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Click me</button>

    <Presence v-bind="api.getBackdropProps()" :class="styles.Backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.Positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.Content">
        <h2 v-bind="api.getTitleProps()" :class="styles.Title">Edit profile</h2>
        <p v-bind="api.getDescriptionProps()" :class="styles.Description">Make changes to your profile here. Click save when you are done.</p>
        <div>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
        <button v-bind="api.getCloseTriggerProps()" :class="styles.CloseTrigger">Close</button>
      </Presence>
    </div>
  </main>
</template>
