<script lang="ts" setup>
import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const SLIDE_COUNT = 30

const page = ref(0)

const dialogService = useMachine(dialog.machine, { id: useId() })
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))

const carouselService = useMachine(
  carousel.machine,
  computed(() => ({
    id: `${useId()}-carousel`,
    count: SLIDE_COUNT,
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
    <button v-bind="dialogApi.getTriggerProps()" data-testid="open-dialog">Open Carousel in Dialog</button>

    <Presence v-bind="dialogApi.getBackdropProps()" />
    <div v-bind="dialogApi.getPositionerProps()">
      <Presence v-bind="dialogApi.getContentProps()">
        <h2 v-bind="dialogApi.getTitleProps()">Carousel in Dialog</h2>
        <p v-bind="dialogApi.getDescriptionProps()">Navigate past page 10 to test the fix.</p>

        <div class="carousel">
          <div v-bind="carouselApi.getRootProps()">
            <div v-bind="carouselApi.getControlProps()">
              <button v-bind="carouselApi.getPrevTriggerProps()">Prev</button>
              <button v-bind="carouselApi.getNextTriggerProps()">Next</button>
            </div>

            <div v-bind="carouselApi.getItemGroupProps()">
              <div
                v-for="index in SLIDE_COUNT"
                :key="index - 1"
                v-bind="carouselApi.getItemProps({ index: index - 1 })"
              >
                <img
                  :src="`https://picsum.photos/seed/slide-${index - 1}/300/200`"
                  :alt="`Slide ${index - 1}`"
                  style="width: 100%"
                />
              </div>
            </div>

            <div v-bind="carouselApi.getIndicatorGroupProps()">
              <button
                v-for="(_, index) in carouselApi.pageSnapPoints"
                :key="index"
                v-bind="carouselApi.getIndicatorProps({ index })"
              ></button>
            </div>

            <p data-testid="page-display">Current page: {{ carouselApi.page }}</p>
          </div>
        </div>

        <button v-bind="dialogApi.getCloseTriggerProps()" data-testid="close-dialog">Close</button>
      </Presence>
    </div>
  </main>
</template>
