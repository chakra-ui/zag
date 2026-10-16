<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"
import "@styles/popover.css"

const service = useMachine(popover.machine, { id: useId() })
const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Filters</button>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <SliderPriceSlider />
        </div>
      </div>
    </Teleport>
  </main>
</template>
