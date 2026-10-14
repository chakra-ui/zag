<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: "1" })
const api = computed(() => dialog.connect(service, normalizeProps))

// Make <html> its own scroll container, like an app-shell layout
onMounted(() => {
  document.documentElement.style.overflowY = "auto"
})
onBeforeUnmount(() => {
  document.documentElement.style.removeProperty("overflow-y")
})
</script>

<template>
  <main>
    <p>The dialog's scroll lock should apply to &lt;html&gt;, not &lt;body&gt;, on this page.</p>

    <button v-bind="api.getTriggerProps()" data-testid="dialog-trigger">Open Dialog</button>

    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Dialog</h2>
          <p v-bind="api.getDescriptionProps()">Dialog content</p>
          <button v-bind="api.getCloseTriggerProps()" data-testid="dialog-close">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div data-testid="tall-content" style="height: 4000px" />
    </Teleport>
  </main>
</template>
