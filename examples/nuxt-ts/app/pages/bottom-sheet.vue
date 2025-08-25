<script setup lang="ts">
import * as bottomSheet from "@zag-js/bottom-sheet"
import { bottomSheetControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(bottomSheetControls)

const service = useMachine(
  bottomSheet.machine,
  controls.mergeProps<bottomSheet.Props>({
    id: useId(),
  }),
)

const api = computed(() => bottomSheet.connect(service, normalizeProps))
</script>

<template>
  <main className="bottom-sheet">
    <button v-bind="api.getTriggerProps()">Open</button>
    <div v-bind="api.getBackdropProps()"></div>
    <div v-bind="api.getContentProps()">
      <div v-bind="api.getGrabberProps()">
        <div v-bind="api.getGrabberIndicatorProps()"></div>
      </div>
      <div>Bottom Sheet</div>
      <div data-no-drag="true">No drag area</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
