<script setup lang="ts">
import * as marquee from "@zag-js/marquee"
import { marqueeTestimonials } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/marquee.css"

const service = useMachine(marquee.machine, {
  id: useId(),
  side: "bottom",
  pauseOnInteraction: true,
})

const api = computed(() => marquee.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="testimonials">
      <div v-bind="api.getRootProps()">
        <div v-bind="api.getEdgeProps({ side: 'top' })" />

        <div v-bind="api.getViewportProps()">
          <div v-for="index in api.contentCount" :key="index - 1" v-bind="api.getContentProps({ index: index - 1 })">
            <figure v-for="item in marqueeTestimonials" :key="item.name" v-bind="api.getItemProps()">
              <blockquote class="quote">{{ item.quote }}</blockquote>
              <figcaption class="author">
                <strong>{{ item.name }}</strong>
                <span>{{ item.role }}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <div v-bind="api.getEdgeProps({ side: 'bottom' })" />
      </div>
      <p class="hint">Hover a testimonial to pause the scroll.</p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
