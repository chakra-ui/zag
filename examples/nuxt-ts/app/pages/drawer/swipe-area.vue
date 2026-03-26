<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import styles from "../../../../shared/styles/drawer.module.css"

const service = useMachine(drawer.machine, { id: useId() })

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div v-bind="api.getSwipeAreaProps()" :class="styles.swipeArea" />
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
        </div>
        <div v-bind="api.getTitleProps()">Drawer</div>
        <p v-bind="api.getDescriptionProps()">Swipe up from the bottom edge to open this drawer.</p>
        <button v-bind="api.getCloseTriggerProps()">Close</button>
        <div :class="styles.scrollable" data-testid="scrollable">
          <div v-for="(_element, index) in Array.from({ length: 100 })" :key="index">Item {{ index }}</div>
        </div>
      </Presence>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['dragOffset', 'snapPoint', 'contentSize']" />
  </Toolbar>
</template>
