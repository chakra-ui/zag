<script setup lang="ts">
import { tourReplacedTargetData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { X } from "lucide-vue-next"
import { computed, ref, useId } from "vue"

const replaced = ref(false)

const service = useMachine(tour.machine, { id: useId(), steps: tourReplacedTargetData })
const api = computed(() => tour.connect(service, normalizeProps))
</script>

<template>
  <main class="tour">
    <div>
      <button @click="api.start()">Start Tour</button>
      <button @click="replaced = true">Replace target</button>

      <div class="steps__container">
        <!-- The same target id, carried by one node or the other -->
        <h3 v-if="!replaced" id="target">Original target</h3>
        <div class="h-200px" />
        <h3 v-if="replaced" id="target">Replacement target</h3>
      </div>
    </div>

    <Teleport to="#teleports" v-if="api.open && api.step">
      <div v-if="api.step?.backdrop" v-bind="api.getBackdropProps()" />
      <div v-bind="api.getSpotlightProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-if="api.step?.arrow" v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>

          <p v-bind="api.getTitleProps()">{{ api.step?.title }}</p>
          <div v-bind="api.getDescriptionProps()">{{ api.step?.description }}</div>

          <div class="tour button__group">
            <button
              v-for="action in api.step?.actions"
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
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
