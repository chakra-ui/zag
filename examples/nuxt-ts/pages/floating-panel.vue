<script setup lang="ts">
import * as floating-panel from "@zag-js/floating-panel"
import { floating-panelControls, floating-panelData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(floating-panel.machine({ id: "1" }))

const api = computed(() => floating-panel.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="floating-panel">
    <div v-bind="api.rootProps">
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
