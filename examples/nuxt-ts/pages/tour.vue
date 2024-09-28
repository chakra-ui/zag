<script setup lang="ts">
import { ref, onMounted, useId } from "vue"
import * as tour from "@zag-js/tour"
import { tourControls, tourData } from "@zag-js/shared"
import { useMachine, normalizeProps } from "@zag-js/vue"
import { X } from "lucide-vue-next"

const controls = useControls(tourControls)

const [state, send] = useMachine(
  tour.machine({
    id: useId(),
    steps: tourData,
  }),
  { context: controls.context },
)

const api = computed(() => tour.connect(state.value, send, normalizeProps))
const open = computed(() => api.value.open && api.value.step)
</script>

<template>
  <main class="tour">
    <div>
      <button @click="api.start()">Start Tour</button>
      <div class="steps__container">
        <h3 id="step-1">Step 1</h3>
        <div class="overflow__container">
          <div class="h-200px" />
          <h3 id="step-2">Step 2</h3>
          <div class="h-100px" />
        </div>
        <Iframe>
          <h1 id="step-2a">Iframe Content</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        </Iframe>
        <h3 id="step-3">Step 3</h3>
        <h3 id="step-4">Step 4</h3>
      </div>
    </div>

    <Teleport to="body" v-if="open">
      <div v-if="api.step.backdrop" v-bind="api.getBackdropProps()" />
      <div v-bind="api.getSpotlightProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-if="api.step.arrow" v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>

          <p v-bind="api.getTitleProps()">{{ api.step.title }}</p>
          <div v-bind="api.getDescriptionProps()">{{ api.step.description }}</div>
          <div v-bind="api.getProgressTextProps()">{{ api.getProgressText() }}</div>

          <div v-if="api.step.actions" class="tour button__group">
            <button
              v-for="action in api.step.actions"
              :key="action.label"
              v-bind="api.getActionTriggerProps({ action })"
            >
              {{ action.label }}
            </button>
          </div>

          <button v-bind="api.getCloseTriggerProps()">
            <X />
          </button>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" :omit="['steps']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
