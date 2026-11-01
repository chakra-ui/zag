<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/popover.css"

const service = useMachine(popover.machine, {
  id: useId(),
  modal: false,
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main class="popover">
    <div data-part="root">
      <button data-testid="button-before">Button :before</button>

      <button data-testid="popover-trigger" v-bind="api.getTriggerProps()">Click me</button>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <Presence data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
            <a href="#" data-testid="focusable-link">Focusable Link</a>
            <input data-testid="input" placeholder="input" />
            <button data-testid="popover-close-button" v-bind="api.getCloseTriggerProps()">
              <XIcon />
            </button>
          </Presence>
        </div>
      </Teleport>
    </div>
  </main>
</template>
