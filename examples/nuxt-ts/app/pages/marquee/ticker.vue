<script setup lang="ts">
import * as marquee from "@zag-js/marquee"
import { marqueeQuotes } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/marquee.css"

const paused = ref(false)
const finished = ref(false)

const id = useId()
const service = useMachine(
  marquee.machine,
  computed(() => ({
    id,
    speed: 200,
    spacing: "2rem",
    loopCount: 2,
    pauseOnInteraction: true,
    paused: paused.value,
    onPauseChange: (details: marquee.PauseStatusDetails) => (paused.value = details.paused),
    onComplete: () => (finished.value = true),
  })),
)

const api = computed(() => marquee.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="ticker">
      <div v-bind="api.getRootProps()">
        <div v-bind="api.getViewportProps()">
          <div v-for="index in api.contentCount" :key="index - 1" v-bind="api.getContentProps({ index: index - 1 })">
            <div v-for="quote in marqueeQuotes" :key="quote.symbol" v-bind="api.getItemProps()">
              <span class="symbol">{{ quote.symbol }}</span>
              <span>{{ quote.price }}</span>
              <span :class="quote.trend === 'up' ? 'up' : 'down'">{{ quote.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button @click="paused = !paused">{{ paused ? "Resume" : "Pause" }}</button>
        <span class="status" role="status" data-testid="status">{{ finished ? "Finished" : "" }}</span>
      </div>
      <p class="hint">Press Pause or hover to stop; it ends after two loops.</p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
