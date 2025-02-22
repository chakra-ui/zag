<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { carouselControls, carouselData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(carouselControls)

const service = useMachine(carousel.machine, {
  id: useId(),
  spacing: "20px",
  slidesPerPage: 2,
  slideCount: carouselData.length,
  allowMouseDrag: true,
})

const api = computed(() => carousel.connect(service, normalizeProps))
</script>

<template>
  <main class="carousel">
    <div v-bind="api.getRootProps()">
      <button @click="() => api.scrollToIndex(4)">Scroll to 4</button>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getAutoplayTriggerProps()">{{ api.isPlaying ? "Stop" : "Play" }}</button>
        <div class="carousel-spacer"></div>
        <button v-bind="api.getPrevTriggerProps()">Prev</button>
        <button v-bind="api.getNextTriggerProps()">Next</button>
      </div>

      <div v-bind="api.getItemGroupProps()">
        <div v-for="(image, index) in carouselData" :key="index" v-bind="api.getItemProps({ index })">
          <img :src="image" alt="" />
        </div>
      </div>

      <div v-bind="api.getIndicatorGroupProps()">
        <button
          v-for="(_, index) in api.pageSnapPoints"
          :key="index"
          v-bind="api.getIndicatorProps({ index })"
        ></button>
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
