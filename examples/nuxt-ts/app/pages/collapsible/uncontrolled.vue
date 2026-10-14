<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/collapsible.css"

const service = useMachine(collapsible.machine, {
  id: useId(),
  defaultOpen: true,
})

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <main class="collapsible">
    <h1>Collapsible Uncontrolled</h1>

    <div v-bind="api.getRootProps()">
      <button v-bind="api.getTriggerProps()">Toggle</button>
      <div v-bind="api.getContentProps()">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  </main>
</template>
