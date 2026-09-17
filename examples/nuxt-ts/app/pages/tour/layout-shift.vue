<script setup lang="ts">
import { tourLayoutShiftData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, ref, useId } from "vue"

const wide = ref(false)
const expanded = ref(false)

const service = useMachine(tour.machine, { id: useId(), steps: tourLayoutShiftData })
const api = computed(() => tour.connect(service, normalizeProps))
</script>

<template>
  <main class="tour layout-shift">
    <button @click="api.start()">Start tour</button>

    <div class="targets">
      <button id="layout-target" :data-wide="wide || undefined">First target</button>
      <button id="other-target" :data-wide="wide || undefined">Second target</button>
    </div>

    <div class="filler" :data-expanded="expanded || undefined">
      {{ expanded ? "Extra content is in the page." : "Use the tour controls to shift the layout." }}
    </div>
  </main>

  <Teleport to="#teleports" v-if="api.open">
    <div v-bind="api.getBackdropProps()" />
    <div v-bind="api.getSpotlightProps()" />
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <p v-bind="api.getTitleProps()">{{ api.step?.title }}</p>
        <div v-bind="api.getDescriptionProps()">{{ api.step?.description }}</div>

        <div class="tour button__group">
          <button @click="wide = !wide">Resize target</button>
          <button @click="expanded = !expanded">Toggle extra content</button>
          <button
            v-for="action in api.step?.actions"
            :key="action.label"
            v-bind="api.getActionTriggerProps({ action })"
          >
            {{ action.label }}
          </button>
        </div>

        <button v-bind="api.getCloseTriggerProps()">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<!-- A fixed-height root that gains overflow — the layout change a ResizeObserver cannot see. -->
<style>
html {
  height: 100%;
}
body {
  min-height: 100%;
}
body,
.page,
.page main {
  overflow: visible;
}
.page {
  height: auto;
  min-height: 100vh;
}
.page main {
  display: block;
}
.nav {
  flex-shrink: 0;
  height: 100vh;
}

.layout-shift {
  padding: 40px;
}
.layout-shift .targets {
  display: flex;
  gap: 80px;
  margin-top: 40px;
}
.layout-shift .targets button {
  width: 160px;
}
.layout-shift .targets button[data-wide] {
  width: 280px;
}
.layout-shift .filler {
  height: 100px;
  padding-top: 40px;
}
.layout-shift .filler[data-expanded] {
  height: 2000px;
}
</style>
