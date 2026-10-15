<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/carousel.css"

const photos = [
  { width: 300, height: 400 },
  { width: 600, height: 400 },
  { width: 400, height: 400 },
  { width: 320, height: 400 },
  { width: 640, height: 400 },
  { width: 400, height: 400 },
  { width: 300, height: 400 },
].map((size, index) => ({ ...size, src: `https://picsum.photos/seed/zag-strip-${index}/${size.width}/${size.height}` }))

const photoService = useMachine(carousel.machine, {
  id: useId(),
  count: photos.length,
  autoSize: true,
  spacing: "8px",
  allowMouseDrag: true,
})
const photoApi = computed(() => carousel.connect(photoService, normalizeProps))
</script>

<template>
  <main>
    <div class="carousel">
      <div v-bind="photoApi.getRootProps()" class="carousel-strip">
        <div v-bind="photoApi.getControlProps()">
          <button v-bind="photoApi.getPrevTriggerProps()"><ChevronLeftIcon /></button>
          <div v-bind="photoApi.getItemGroupProps()">
            <div v-for="(photo, index) in photos" :key="photo.src" v-bind="photoApi.getItemProps({ index })">
              <img :src="photo.src" :width="photo.width" :height="photo.height" alt="" />
            </div>
          </div>
          <button v-bind="photoApi.getNextTriggerProps()"><ChevronRightIcon /></button>
        </div>
      </div>
    </div>
  </main>
</template>
