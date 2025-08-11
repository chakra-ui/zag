<script setup lang="ts">
import * as scrollView from "@zag-js/scroll-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, useId } from "vue"

const service = useMachine(scrollView.machine, { id: useId() })
const api = computed(() => scrollView.connect(service, normalizeProps))
</script>

<template>
  <main class="scroll-view">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <div v-bind="api.getContentProps()">
          <div v-for="i in 100" :key="i">{{ i }}</div>
        </div>
      </div>
      <div v-bind="api.getScrollbarProps()">
        <div v-bind="api.getThumbProps()" />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
