<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"
import "@styles/popover.css"

const service = useMachine(popover.machine, {
  id: "2",
  modal: true,
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main class="popover">
    <div data-part="root">
      <button data-testid="button-before">Button :before</button>

      <button data-testid="popover-trigger" v-bind="api.getTriggerProps()">
        Click me
        <div v-bind="api.getIndicatorProps()">{{ ">" }}</div>
      </button>

      <div v-bind="api.getAnchorProps()">anchor</div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
            <SliderPopoverRange />
          </div>
        </div>
      </Teleport>
      <span data-testid="plain-text">I am just text</span>
      <button data-testid="button-after">Button :after</button>
    </div>
  </main>
</template>
