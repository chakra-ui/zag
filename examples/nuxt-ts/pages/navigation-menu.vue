<script setup lang="ts">
import * as navigationMenu from "@zag-js/navigation-menu"
import { navigationMenuControls, navigationMenuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(navigationMenu.machine({ id: "1" }))

const api = computed(() => navigationMenu.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="navigation-menu">
    <div v-bind="api.getRootProps()">
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
