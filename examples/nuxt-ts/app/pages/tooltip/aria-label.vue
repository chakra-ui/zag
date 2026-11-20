<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip.css"

const id = "tip-1"
const service = useMachine(tooltip.machine, { id, "aria-label": "Save the document" })
const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <main class="tooltip">
    <div class="root">
      <button :data-testid="`${id}-trigger`" v-bind="api.getTriggerProps()">Save</button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <Presence class="tooltip-content" :data-testid="`${id}-tooltip`" v-bind="api.getContentProps()">
            Save <kbd>⌘S</kbd>
          </Presence>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
