<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card.css"

const service = useMachine(hoverCard.machine, { id: useId(), openDelay: 300 })
const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <p style="max-width: 360px; line-height: 2; font-size: 15px">
      Zag is built on
      <a href="#" data-testid="wrapped-trigger" v-bind="api.getTriggerProps({ value: 'a' })"
        >a set of framework agnostic state machines that describe every interaction a component supports, so the same
        logic runs everywhere</a
      >
      and behaves identically. Every machine ships
      <a href="#" data-testid="wrapped-trigger-2" v-bind="api.getTriggerProps({ value: 'b' })"
        >keyboard interactions and ARIA attributes that follow the authoring practices, tested across all the supported
        frameworks</a
      >
      before release.
    </p>

    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>
          Anchored to {{ api.triggerValue }}
          <!-- Switches without the pointer reaching the other trigger -->
          <button data-testid="switch-trigger" @click="api.setTriggerValue(api.triggerValue === 'a' ? 'b' : 'a')">
            Switch
          </button>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
