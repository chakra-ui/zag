<script setup lang="ts">
import * as bottomSheet from "@zag-js/bottom-sheet"
import { bottomSheetControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"

const controls = useControls(bottomSheetControls)

const service = useMachine(
  bottomSheet.machine,
  controls.mergeProps<bottomSheet.Props>({
    id: useId(),
    snapPoints: [0.25, "250px", 1],
  }),
)

const api = computed(() => bottomSheet.connect(service, normalizeProps))
</script>

<template>
  <main className="bottom-sheet">
    <button v-bind="api.getTriggerProps()">Open</button>
    <Presence v-bind="api.getBackdropProps()"></Presence>
    <Presence v-bind="api.getContentProps()">
      <div v-bind="api.getGrabberProps()">
        <div v-bind="api.getGrabberIndicatorProps()"></div>
      </div>
      <div v-bind="api.getTitleProps()">Bottom Sheet</div>
      <div data-no-drag="true">No drag area</div>
      <div class="scrollable">
        <div v-for="(_element, index) in Array.from({ length: 100 })" :key="index">Item {{ index }}</div>
      </div>
    </Presence>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['dragOffset', 'activeSnapPoint', 'resolvedActiveSnapPoint']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
