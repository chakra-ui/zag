<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { drawerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import styles from "../../../../shared/styles/drawer.module.css"

const controls = useControls(drawerControls)

const service = useMachine(
  drawer.machine,
  controls.mergeProps<drawer.Props>({
    id: useId(),
    snapPoints: ["20rem", 1],
    defaultSnapPoint: "20rem",
  }),
)

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()" :class="styles.trigger">Open</button>
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop"></Presence>
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator"></div>
        </div>
        <div v-bind="api.getTitleProps()">Drawer</div>
        <div data-no-drag="true" :class="styles.noDrag">No drag area</div>
        <div :class="styles.scrollable">
          <div v-for="(_element, index) in Array.from({ length: 100 })" :key="index">Item {{ index }}</div>
        </div>
      </Presence>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['dragOffset', 'snapPoint', 'resolvedActiveSnapPoint']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
