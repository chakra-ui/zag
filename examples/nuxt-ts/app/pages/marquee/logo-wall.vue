<script setup lang="ts">
import * as marquee from "@zag-js/marquee"
import { marqueeBrands } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/marquee.css"

const service = useMachine(marquee.machine, {
  id: useId(),
  autoFill: true,
  spacing: "1.5rem",
})

const api = computed(() => marquee.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="logo-wall">
      <div v-bind="api.getRootProps()">
        <div v-bind="api.getEdgeProps({ side: 'start' })" />

        <div v-bind="api.getViewportProps()">
          <div v-for="index in api.contentCount" :key="index - 1" v-bind="api.getContentProps({ index: index - 1 })">
            <div v-for="brand in marqueeBrands" :key="brand" v-bind="api.getItemProps()">
              <span class="wordmark">{{ brand }}</span>
            </div>
          </div>
        </div>

        <div v-bind="api.getEdgeProps({ side: 'end' })" />
      </div>
      <p class="hint">The logos repeat to fill the full width.</p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
