<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import Presence from "~/components/Presence.vue"
import styles from "@styles/drawer.module.css"

const id = useId()
const open = ref(true)

const service = useMachine(
  drawer.machine,
  computed<drawer.Props>(() => ({
    id,
    open: open.value,
    onOpenChange(details) {
      // Simulate an async setter (history API, transitions, etc.)
      setTimeout(() => (open.value = details.open), 1000)
    },
  })),
)

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main style="padding: 20px">
    <h3>Controlled (async/delayed setter)</h3>
    <p style="font-size: 14px; color: #6b7280">
      The <code>open</code> setter is delayed by 80ms to mimic an async source of truth.
    </p>
    <button :class="styles.trigger" v-bind="api.getTriggerProps()">Toggle Drawer</button>
    <Presence :class="styles.backdrop" v-bind="api.getBackdropProps()" />
    <div :class="styles.positioner" v-bind="api.getPositionerProps()">
      <Presence :class="styles.content" v-bind="api.getContentProps()">
        <div :class="styles.grabber" v-bind="api.getGrabberProps()">
          <div :class="styles.grabberIndicator" v-bind="api.getGrabberIndicatorProps()" />
        </div>
        <div v-bind="api.getTitleProps()">Controlled Drawer (async)</div>
        <p v-bind="api.getDescriptionProps()">Swipe down to close or click the backdrop. Watch for flicker.</p>
        <p style="font-size: 14px">
          Open: <strong>{{ String(open) }}</strong>
        </p>
        <button v-bind="api.getCloseTriggerProps()">
          <XIcon />
        </button>
      </Presence>
    </div>
  </main>
</template>
