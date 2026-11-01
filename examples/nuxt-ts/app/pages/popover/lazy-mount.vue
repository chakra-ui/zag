<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/popover.css"

const service = useMachine(popover.machine, { id: useId() })

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main class="popover">
    <div data-part="root">
      <button data-testid="popover-trigger" v-bind="api.getTriggerProps()">Click me</button>

      <div v-bind="api.getPositionerProps()">
        <div v-if="api.open" data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
          <div data-testid="popover-title" v-bind="api.getTitleProps()">Popover Title</div>
          <div data-testid="popover-description" v-bind="api.getDescriptionProps()">Popover Description</div>
          <button data-testid="popover-close-button" v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
