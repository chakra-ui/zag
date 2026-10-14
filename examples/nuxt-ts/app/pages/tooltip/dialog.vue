<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/tooltip.css"
import "@styles/dialog.css"

const tooltipService = useMachine(tooltip.machine, { id: useId(), ids: { trigger: "t1" } })
const dialogService = useMachine(dialog.machine, { id: useId(), ids: { trigger: "t1" } })

const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))
</script>

<template>
  <main class="tooltip">
    <div class="root">
      <button v-bind="mergeProps(tooltipApi.getTriggerProps(), dialogApi.getTriggerProps())">Hover me</button>

      <Teleport v-if="tooltipApi.open" to="#teleports">
        <div v-bind="tooltipApi.getPositionerProps()">
          <div v-bind="tooltipApi.getContentProps()">Tooltip</div>
        </div>
      </Teleport>

      <Teleport v-if="dialogApi.open" to="#teleports">
        <div v-bind="dialogApi.getBackdropProps()" />
        <div v-bind="dialogApi.getPositionerProps()">
          <div v-bind="dialogApi.getContentProps()">
            <h2 v-bind="dialogApi.getTitleProps()">Edit profile</h2>
            <p v-bind="dialogApi.getDescriptionProps()">
              Make changes to your profile here. Click save when you are done.
            </p>
            <div>
              <TooltipHoverItem />
              <input placeholder="Enter name..." />
              <button>Save</button>
            </div>
            <button v-bind="dialogApi.getCloseTriggerProps()">
              <XIcon />
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>
