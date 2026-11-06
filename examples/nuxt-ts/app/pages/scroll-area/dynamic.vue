<script setup lang="ts">
import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scroll-area.css"

const count = ref(3)
const service = useMachine(scrollArea.machine, { id: useId() })
const api = computed(() => scrollArea.connect(service, normalizeProps))
</script>

<template>
  <main class="scroll-area">
    <div style="display: flex; gap: 8px">
      <button @click="count = 40">Add rows</button>
      <button @click="count = 3">Remove rows</button>
      <button @click="api.scrollToEdge({ edge: 'bottom' })">Scroll to bottom</button>
    </div>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <div v-bind="api.getContentProps()">
          <div v-for="index in count" :key="index">Row {{ index }}</div>
        </div>
      </div>
      <div v-if="api.hasOverflowY" v-bind="api.getScrollbarProps({ orientation: 'vertical' })">
        <div v-bind="api.getThumbProps({ orientation: 'vertical' })" />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
