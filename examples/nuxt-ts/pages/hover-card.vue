<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(hoverCardControls)

const [state, send] = useMachine(hoverCard.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => hoverCard.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <div style="display: flex; gap: 50px">
      <a href="https://twitter.com/zag_js" target="_blank" v-bind="api.triggerProps"> Twitter </a>

      <Teleport to="body" v-if="api.isOpen">
        <div v-bind="api.positionerProps">
          <div v-bind="api.contentProps">
            <div v-bind="api.arrowProps">
              <div v-bind="api.arrowTipProps" />
            </div>
            Twitter Preview
            <a href="https://twitter.com/zag_js" target="_blank"> Twitter </a>
          </div>
        </div>
      </Teleport>

      <div data-part="test-text">Test text</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
