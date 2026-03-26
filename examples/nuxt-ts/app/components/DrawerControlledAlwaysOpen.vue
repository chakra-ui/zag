<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import { computed } from "vue"
import styles from "../../../shared/styles/drawer.module.css"

const id = useId()

const service = useMachine(drawer.machine, {
  id,
  open: true,
})

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <div>
    <h3>Always Open (no onOpenChange)</h3>
    <p style="font-size: 14px; color: #6b7280">
      This drawer has <code>open: true</code> without <code>onOpenChange</code>. Swiping, escape, and outside click should
      have no effect.
    </p>
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
        </div>
        <div v-bind="api.getTitleProps()">Always Open</div>
        <p v-bind="api.getDescriptionProps()">
          Try swiping down, pressing Escape, or clicking outside. This drawer should never close.
        </p>
      </Presence>
    </div>
  </div>
</template>
