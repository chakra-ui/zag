<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { drawerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import styles from "../../../shared/styles/drawer.module.css"

const controls = useControls(drawerControls)

const service = useMachine(
  drawer.machine,
  controls.mergeProps<drawer.Props>({
    id: useId(),
  }),
)

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button :class="styles.trigger" v-bind="api.getTriggerProps()">Open</button>
    <div :class="styles.backdrop" v-bind="api.getBackdropProps()"></div>
    <div :class="styles.positioner" v-bind="api.getPositionerProps()">
      <div :class="styles.content" v-bind="api.getContentProps()">
        <div :class="styles.grabber" v-bind="api.getGrabberProps()">
          <div :class="styles.grabberIndicator" v-bind="api.getGrabberIndicatorProps()"></div>
        </div>
        <div v-bind="api.getTitleProps()">Drawer</div>
        <div data-no-drag="true" :class="styles.noDrag">No drag area</div>
        <div :class="styles.scrollable">
          <div v-for="(_element, index) in Array.from({ length: 100 })" :key="index">Item {{ index }}</div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
