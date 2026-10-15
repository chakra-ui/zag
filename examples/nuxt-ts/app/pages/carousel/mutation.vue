<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/carousel.css"

const slides = ref([1, 2, 3, 4])

const id = useId()
const service = useMachine(
  carousel.machine,
  computed(() => ({
    id,
    count: slides.value.length,
    slidesPerPage: 2,
    spacing: "16px",
  })),
)

const api = computed(() => carousel.connect(service, normalizeProps))

const addSlide = () => (slides.value = [...slides.value, Math.max(0, ...slides.value) + 1])
const removeSlide = () => (slides.value = slides.value.slice(0, -1))
</script>

<template>
  <main>
    <div class="carousel">
      <div v-bind="api.getRootProps()">
        <div class="carousel-toolbar">
          <button @click="addSlide">Add slide</button>
          <button :disabled="slides.length <= 1" @click="removeSlide">Remove slide</button>
        </div>

        <div v-bind="api.getControlProps()">
          <button v-bind="api.getPrevTriggerProps()"><ChevronLeftIcon /></button>
          <div v-bind="api.getItemGroupProps()">
            <div v-for="(slide, index) in slides" :key="slide" v-bind="api.getItemProps({ index })">
              <div class="carousel-card">{{ slide }}</div>
            </div>
          </div>
          <button v-bind="api.getNextTriggerProps()"><ChevronRightIcon /></button>
        </div>

        <div class="carousel-footer">
          <div v-bind="api.getIndicatorGroupProps()">
            <button v-for="(_, index) in api.pageSnapPoints" :key="index" v-bind="api.getIndicatorProps({ index })" />
          </div>
          <span v-bind="api.getProgressTextProps()">{{ api.getProgressText() }}</span>
        </div>
      </div>
    </div>
  </main>
</template>
