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
      <a href="https://twitter.com/zag_js" target="_blank" v-bind="api.getTriggerProps()"> Twitter </a>

      <Teleport to="body" v-if="api.open">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getArrowProps()">
              <div v-bind="api.getArrowTipProps()" />
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
