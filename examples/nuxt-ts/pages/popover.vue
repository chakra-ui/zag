<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { popoverControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(popoverControls)

const [state, send] = useMachine(popover.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => popover.connect(state.value, send, normalizeProps))
</script>

<template>
  <main>
    <div data-part="root">
      <button data-testid="button-before">Button :before</button>
      <button data-testid="popover-trigger" v-bind="api.triggerProps">Click me</button>
      <Teleport to="body" :disabled="!api.portalled">
        <div v-bind="api.positionerProps">
          <div data-testid="popover-content" class="popover-content" v-bind="api.contentProps">
            <div v-bind="api.arrowProps">
              <div v-bind="api.arrowTipProps" />
            </div>
            <div data-testid="popover-title" v-bind="api.titleProps">Popover Title</div>
            <div data-part="body" data-testid="popover-body">
              <a>Non-focusable Link</a>
              <a href="#" data-testid="focusable-link"> Focusable Link </a>
              <input data-testid="input" placeholder="input" />
              <button data-testid="popover-close-button" v-bind="api.closeTriggerProps">X</button>
            </div>
          </div>
        </div>
      </Teleport>
      <span data-testid="plain-text">I am just text</span>
      <button data-testid="button-after">Button :after</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
