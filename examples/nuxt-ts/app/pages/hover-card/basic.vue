<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card.css"

const controls = useControls(hoverCardControls)

const service = useMachine(
  hoverCard.machine,
  controls.mergeProps<hoverCard.Props>({
    id: useId(),
  }),
)

const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <div style="display: flex; gap: 50px">
      <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" v-bind="api.getTriggerProps()">@zag_js</a>

      <Teleport v-if="api.open" to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getArrowProps()">
              <div v-bind="api.getArrowTipProps()" />
            </div>
            <div class="profile">
              <span class="profile-avatar" aria-hidden="true">Z</span>
              <div class="profile-body">
                <span class="profile-name">Zag.js</span>
                <span class="profile-handle">@zag_js</span>
                <p class="profile-bio">
                  UI components powered by finite state machines. Works with React, Solid, Vue and Svelte.
                </p>
                <a class="profile-meta" href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                  twitter.com/zag_js
                </a>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <div data-testid="test-text">Test text</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
