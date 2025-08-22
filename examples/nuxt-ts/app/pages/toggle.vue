<script setup lang="ts">
import * as toggle from "@zag-js/toggle"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(toggle.machine)

const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle">
    <button v-bind="api.getRootProps()">
      <span v-bind="api.getIndicatorProps()">
        <BoldIcon />
      </span>
    </button>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
