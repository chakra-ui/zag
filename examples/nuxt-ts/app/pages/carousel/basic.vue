<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { carouselControls, carouselData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-vue-next"
import "@styles/carousel.css"

const controls = useControls(carouselControls)

const service = useMachine(
  carousel.machine,
  controls.mergeProps<carousel.Props>({
    id: useId(),
    spacing: "16px",
    slidesPerPage: 2,
    count: carouselData.length,
    allowMouseDrag: true,
  }),
)

const api = computed(() => carousel.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="carousel">
      <div v-bind="api.getRootProps()">
        <div class="carousel-toolbar">
          <button @click="api.scrollToIndex(4)">Scroll to 4</button>
        </div>

        <div v-bind="api.getControlProps()">
          <button v-bind="api.getPreviousTriggerProps()"><ChevronLeftIcon /></button>
          <div v-bind="api.getItemGroupProps()">
            <div
              v-for="(image, index) in carouselData"
              :key="index"
              v-bind="api.getItemProps({ index })"
              class="carousel-photo"
            >
              <img :src="image" alt="" />
            </div>
          </div>
          <button v-bind="api.getNextTriggerProps()"><ChevronRightIcon /></button>
        </div>

        <div class="carousel-footer">
          <button v-bind="api.getAutoplayTriggerProps()">
            <PauseIcon v-if="api.isPlaying" />
            <PlayIcon v-else />
            <span class="sr-only">{{ api.isPlaying ? "Stop" : "Play" }}</span>
          </button>
          <div v-bind="api.getIndicatorGroupProps()">
            <button v-for="(_, index) in api.pageSnapPoints" :key="index" v-bind="api.getIndicatorProps({ index })" />
          </div>
          <span v-bind="api.getProgressTextProps()">{{ api.getProgressText() }}</span>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['translations']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
