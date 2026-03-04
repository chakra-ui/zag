<script setup lang="ts">
import * as marquee from "@zag-js/marquee"
import { marqueeControls, marqueeData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(marqueeControls)

const service = useMachine(
  marquee.machine,
  controls.mergeProps<marquee.Props>({
    id: useId(),
    spacing: "2rem",
  }),
)

const api = computed(() => marquee.connect(service, normalizeProps))
</script>

<template>
  <main class="marquee">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getEdgeProps({ side: 'start' })" />

      <div v-bind="api.getViewportProps()">
        <div v-for="index in api.contentCount" :key="index - 1" v-bind="api.getContentProps({ index: index - 1 })">
          <div v-for="(item, i) in marqueeData" :key="i" v-bind="api.getItemProps()">
            <span class="marquee-logo">{{ item.logo }}</span>
            <span class="marquee-name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div v-bind="api.getEdgeProps({ side: 'end' })" />
    </div>

    <div class="controls">
      <button @click="api.pause()">Pause</button>
      <button @click="api.resume()">Resume</button>
      <button @click="api.togglePause()">Toggle</button>
      <span>Status: {{ api.paused ? "Paused" : "Playing" }}</span>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
