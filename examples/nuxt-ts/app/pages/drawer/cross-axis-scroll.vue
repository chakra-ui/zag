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
    <button v-bind="api.getTriggerProps()" :class="styles.trigger">Open Drawer</button>
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
        </div>
        <div v-bind="api.getTitleProps()">Cross-Axis Scroll</div>
        <p v-bind="api.getDescriptionProps()">
          Try scrolling the image carousel horizontally. It should scroll without triggering the drawer drag.
        </p>

        <div
          data-testid="horizontal-scroll"
          style="display: flex; gap: 12px; overflow-x: auto; padding: 16px"
        >
          <div
            v-for="i in 10"
            :key="i"
            style="
              width: 200px;
              height: 120px;
              border-radius: 12px;
              flex-shrink: 0;
              background: #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              color: #6b7280;
            "
          >
            {{ i }}
          </div>
        </div>

        <div :class="styles.scrollable" data-testid="scrollable">
          <div v-for="(_element, index) in Array.from({ length: 50 })" :key="index" style="padding: 4px 16px">
            Item {{ index }}
          </div>
        </div>
      </Presence>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['dragOffset', 'snapPoint']" />
  </Toolbar>
</template>
