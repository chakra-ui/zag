<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/carousel.css"

const items = Array.from({ length: 10 }, (_, index) => index)

const THUMBNAIL_SLIDES_PER_PAGE = 6.75

const mainService = useMachine(carousel.machine, {
  id: useId(),
  count: items.length,
  slidesPerPage: 1,
  onPageChange(details) {
    const index = Math.floor((details.page + 1) / THUMBNAIL_SLIDES_PER_PAGE)
    thumbnailApi.value.scrollTo(index)
  },
})

const mainApi = computed(() => carousel.connect(mainService, normalizeProps))

const thumbnailService = useMachine(carousel.machine, {
  id: useId(),
  count: items.length,
  slidesPerPage: THUMBNAIL_SLIDES_PER_PAGE,
  spacing: "12px",
})

const thumbnailApi = computed(() => carousel.connect(thumbnailService, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="mainApi.getRootProps()">
      <div v-bind="mainApi.getControlProps()">
        <button v-bind="mainApi.getPrevTriggerProps()">Prev</button>
        <button v-bind="mainApi.getNextTriggerProps()">Next</button>
      </div>
      <div v-bind="mainApi.getItemGroupProps()">
        <div v-for="index in items" :key="index" v-bind="mainApi.getItemProps({ index })">
          {{ index + 1 }}
        </div>
      </div>
      <div v-bind="thumbnailApi.getRootProps()">
        <div v-bind="thumbnailApi.getItemGroupProps()">
          <div
            v-for="index in items"
            :key="index"
            v-bind="thumbnailApi.getItemProps({ index })"
            @click="mainApi.scrollToIndex(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
