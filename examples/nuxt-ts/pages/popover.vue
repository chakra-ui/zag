<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { popoverControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(popoverControls)

const service = useMachine(popover.machine, {
  id: useId(),
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div data-part="root">
      <button data-testid="button-before">Button :before</button>
      <button data-testid="popover-trigger" v-bind="api.getTriggerProps()">
        Click me
        <div v-bind="api.getIndicatorProps()">{{ ">" }}</div>
      </button>
      <Teleport to="body" :disabled="!api.portalled">
        <div v-bind="api.getPositionerProps()">
          <div data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
            <div v-bind="api.getArrowProps()">
              <div v-bind="api.getArrowTipProps()" />
            </div>
            <div data-testid="popover-title" v-bind="api.getTitleProps()">Popover Title</div>
            <div data-part="body" data-testid="popover-body">
              <a>Non-focusable Link</a>
              <a href="#" data-testid="focusable-link"> Focusable Link </a>
              <input data-testid="input" placeholder="input" />
              <button data-testid="popover-close-button" v-bind="api.getCloseTriggerProps()">X</button>
            </div>
          </div>
        </div>
      </Teleport>
      <span data-testid="plain-text">I am just text</span>
      <button data-testid="button-after">Button :after</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
