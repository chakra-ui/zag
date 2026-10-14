<script setup lang="ts">
import * as scrollArea from "@zag-js/scroll-area"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scroll-area.css"

const service = useMachine(scrollArea.machine, { id: useId() })
const api = computed(() => scrollArea.connect(service, normalizeProps))
</script>

<template>
  <main class="scroll-area">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <div
          v-bind="mergeProps(api.getContentProps(), { style: { display: 'flex', flexDirection: 'column-reverse' } })"
        >
          <div v-for="(_, index) in 100" :key="index">Item {{ index }}</div>
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
