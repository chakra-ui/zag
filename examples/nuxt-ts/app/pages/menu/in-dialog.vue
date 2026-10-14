<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/menu.css"
import "@styles/dialog.css"

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 20px">
    <button v-bind="api.getTriggerProps()" data-testid="trigger-1">Open Dialog with Nested Menu</button>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div data-testid="positioner-1" v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Dialog with Nested Menu</h2>
          <p v-bind="api.getDescriptionProps()">
            This dialog contains a menu with multiple nested submenus. The focus trap should include all menu levels,
            even though they are portalled.
          </p>
          <div style="margin-top: 20px">
            <MenuInDialogNestedMenu />
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end">
            <button v-bind="api.getCloseTriggerProps()">
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
