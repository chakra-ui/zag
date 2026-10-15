<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/carousel.css"

const images = Array.from({ length: 8 }, (_, index) => `https://picsum.photos/seed/zag-gallery-${index}/800/500`)

const mainService = useMachine(carousel.machine, {
  id: useId(),
  count: images.length,
  slidesPerPage: 1,
  onPageChange: (details) => thumbnails.value.scrollToIndex(details.page),
})
const main = computed(() => carousel.connect(mainService, normalizeProps))

const thumbnailService = useMachine(carousel.machine, {
  id: useId(),
  count: images.length,
  // The cut-off sixth thumbnail shows the strip scrolls
  slidesPerPage: 5.5,
  spacing: "8px",
})
const thumbnails = computed(() => carousel.connect(thumbnailService, normalizeProps))
</script>

<template>
  <main>
    <div class="carousel">
      <div v-bind="main.getRootProps()">
        <div v-bind="main.getControlProps()">
          <button v-bind="main.getPreviousTriggerProps()"><ChevronLeftIcon /></button>
          <div v-bind="main.getItemGroupProps()">
            <div
              v-for="(src, index) in images"
              :key="index"
              v-bind="main.getItemProps({ index })"
              class="carousel-photo"
            >
              <img :src="src" :alt="`Photo ${index + 1}`" />
            </div>
          </div>
          <button v-bind="main.getNextTriggerProps()"><ChevronRightIcon /></button>
        </div>

        <div v-bind="thumbnails.getRootProps()" class="carousel-thumbnails">
          <div v-bind="thumbnails.getItemGroupProps()">
            <div
              v-for="(src, index) in images"
              :key="index"
              v-bind="thumbnails.getItemProps({ index })"
              :data-selected="main.page === index || undefined"
              @click="main.scrollToIndex(index)"
            >
              <img :src="src" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
