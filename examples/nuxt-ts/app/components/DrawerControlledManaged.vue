<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import { computed, ref } from "vue"
import styles from "../../../shared/styles/drawer.module.css"

const id = useId()
const isOpen = ref(false)

const service = useMachine(
  drawer.machine,
  computed(() => ({
    id,
    open: isOpen.value,
    onOpenChange(details: { open: boolean }) {
      isOpen.value = details.open
    },
  })),
)

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <div>
    <h3>Controlled (open + onOpenChange)</h3>
    <p style="font-size: 14px; color: #6b7280">Standard controlled mode. Open state is managed by Vue.</p>
    <button v-bind="api.getTriggerProps()" :class="styles.trigger">Open Controlled</button>
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
        </div>
        <div v-bind="api.getTitleProps()">Controlled Drawer</div>
        <p v-bind="api.getDescriptionProps()">
          This drawer is fully controlled. Swipe, escape, and outside click all work.
        </p>
        <p style="font-size: 14px">
          Open: <strong>{{ String(isOpen) }}</strong>
        </p>
        <button v-bind="api.getCloseTriggerProps()">Close</button>
      </Presence>
    </div>
  </div>
</template>
