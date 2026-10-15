<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-vue-next"
import "@styles/carousel.css"
import "@styles/dialog.css"

const images = Array.from({ length: 12 }, (_, index) => `https://picsum.photos/seed/zag-product-${index}/800/500`)

const page = ref(0)
const carouselId = `${useId()}-carousel`

const dialogService = useMachine(dialog.machine, { id: useId() })
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))

const carouselService = useMachine(
  carousel.machine,
  computed(() => ({
    id: carouselId,
    count: images.length,
    page: page.value,
    onPageChange(details: { page: number }) {
      page.value = details.page
    },
  })),
)
const carouselApi = computed(() => carousel.connect(carouselService, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="dialogApi.getTriggerProps()" data-testid="open-dialog">View product images</button>

    <Teleport to="#teleports">
      <Presence v-bind="dialogApi.getBackdropProps()" />
      <div v-bind="dialogApi.getPositionerProps()">
        <Presence v-bind="dialogApi.getContentProps()" class="carousel">
          <h2 v-bind="dialogApi.getTitleProps()">Product images</h2>
          <p v-bind="dialogApi.getDescriptionProps()">Use the arrows or swipe to browse.</p>

          <div v-bind="carouselApi.getRootProps()">
            <div v-bind="carouselApi.getControlProps()">
              <button v-bind="carouselApi.getPrevTriggerProps()"><ChevronLeftIcon /></button>
              <div v-bind="carouselApi.getItemGroupProps()">
                <div
                  v-for="(src, index) in images"
                  :key="index"
                  v-bind="carouselApi.getItemProps({ index })"
                  class="carousel-photo"
                >
                  <img :src="src" :alt="`Product image ${index + 1}`" />
                </div>
              </div>
              <button v-bind="carouselApi.getNextTriggerProps()"><ChevronRightIcon /></button>
            </div>
            <span v-bind="carouselApi.getProgressTextProps()" data-testid="page-display">
              {{ carouselApi.getProgressText() }}
            </span>
          </div>

          <button v-bind="dialogApi.getCloseTriggerProps()" data-testid="close-dialog">
            <XIcon />
          </button>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
