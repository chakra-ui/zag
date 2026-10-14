<script setup lang="ts">
import * as scrollArea from "@zag-js/scroll-area"
import { scrollAreaControls } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scroll-area.css"

const controls = useControls(scrollAreaControls)

const service = useMachine(scrollArea.machine, controls.mergeProps<scrollArea.Props>({ id: useId() }))
const api = computed(() => scrollArea.connect(service, normalizeProps))
</script>

<template>
  <main class="scroll-area">
    <button @click="api.scrollToEdge({ edge: 'bottom' })">Scroll to bottom</button>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <div v-bind="mergeProps(api.getContentProps(), { style: { minWidth: '800px' } })">
          <div v-for="(_, index) in 100" :key="index">{{ index }}</div>
        </div>
      </div>
      <div v-if="api.hasOverflowY" v-bind="api.getScrollbarProps({ orientation: 'vertical' })">
        <div v-bind="api.getThumbProps({ orientation: 'vertical' })" />
      </div>
      <div v-if="api.hasOverflowX" v-bind="api.getScrollbarProps({ orientation: 'horizontal' })">
        <div v-bind="api.getThumbProps({ orientation: 'horizontal' })" />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
