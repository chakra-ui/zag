<script setup lang="ts">
import * as tour from "@zag-js/tour"
import { tourControls, tourData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(tour.machine({ id: "1" }))

const api = computed(() => tour.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="tour">
    <div v-bind="api.rootProps">
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
