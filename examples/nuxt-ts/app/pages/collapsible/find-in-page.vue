<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronDownIcon } from "lucide-vue-next"
import "@styles/collapsible.css"

const service = useMachine(collapsible.machine, { id: useId(), hiddenUntilFound: true })
const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <main class="collapsible">
    <p>Search the page for “keyboard” to open the changelog.</p>
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getTriggerProps()">
        Full changelog
        <div v-bind="api.getIndicatorProps()"><ChevronDownIcon /></div>
      </button>
      <div v-bind="api.getContentProps()">
        <ul>
          <li>Added keyboard support for reordering items.</li>
          <li>Fixed focus returning to the trigger after closing.</li>
          <li>Improved the open animation on slower devices.</li>
        </ul>
      </div>
    </div>
  </main>
</template>
