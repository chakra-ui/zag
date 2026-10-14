<script setup lang="ts">
import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/carousel.css"

const index = ref(0)
const images = ref([0, 1, 2, 3, 4])

const id = useId()
const service = useMachine(
  carousel.machine,
  computed(() => ({
    id,
    count: images.value.length,
    loop: true,
    autoPlay: { delay: 1000 },
    onPageChange: ({ page }) => {
      index.value = page
    },
    page: index.value,
  })),
)

const api = computed(() => carousel.connect(service, normalizeProps))

const onAdd = () => {
  const max = Math.max(...images.value)
  images.value = [...images.value, max + 1]
}
</script>

<template>
  <main class="carousel">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getAutoplayTriggerProps()">{{ api.isPlaying ? "Stop" : "Play" }}</button>
        <div class="carousel-spacer" />
        <button v-bind="api.getPrevTriggerProps()">&laquo;</button>
        <button v-bind="api.getNextTriggerProps()">&raquo;</button>
      </div>

      <div v-bind="api.getIndicatorGroupProps()">
        <button v-for="(_, i) in api.pageSnapPoints" :key="i" v-bind="api.getIndicatorProps({ index: i })">
          {{ i }}
        </button>
      </div>

      <div v-bind="api.getItemGroupProps()">
        <div v-for="(image, i) in images" :key="image" v-bind="api.getItemProps({ index: i })">
          <div
            style="
              width: 188px;
              height: 188px;
              background-color: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            Slide {{ image }}
          </div>
        </div>
      </div>
    </div>

    <p>
      <button @click="onAdd">add slide</button>
    </p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['translations']" />
  </Toolbar>
</template>
