<script setup lang="ts">
import styles from "../../../../../shared/src/css/scroll-area.module.css"
import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, useId } from "vue"

const service = useMachine(scrollArea.machine, { id: useId() })
const api = computed(() => scrollArea.connect(service, normalizeProps))
</script>

<template>
  <main class="scroll-area">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getViewportProps()" :class="styles.Viewport">
        <div v-bind="api.getContentProps()" :class="styles.Content">
          <div v-for="i in 100" :key="i">{{ i }}</div>
        </div>
      </div>
      <div v-bind="api.getScrollbarProps()" :class="styles.Scrollbar">
        <div v-bind="api.getThumbProps()" :class="styles.Thumb" />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
