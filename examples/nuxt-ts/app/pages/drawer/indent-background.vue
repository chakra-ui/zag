<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import { computed, onMounted, onUnmounted, shallowRef } from "vue"
import styles from "../../../../shared/styles/drawer-indent.module.css"

const stack = drawer.createStack()
const snapshot = shallowRef(stack.getSnapshot())

onMounted(() => {
  const unsub = stack.subscribe(() => {
    snapshot.value = stack.getSnapshot()
  })
  onUnmounted(unsub)
})

const service = useMachine(drawer.machine, {
  id: useId(),
  stack,
})

const api = computed(() => drawer.connect(service, normalizeProps))
const stackApi = computed(() => drawer.connectStack(snapshot.value, normalizeProps))
</script>

<template>
  <main :class="styles.main">
    <div
      v-bind="stackApi.getIndentBackgroundProps()"
      :class="styles.indentBackground"
      data-testid="drawer-indent-background"
    />

    <div v-bind="stackApi.getIndentProps()" :class="styles.indent" data-testid="drawer-indent">
      <h2 :class="styles.heading">Drawer Indent Background</h2>
      <p :class="styles.description">
        Open and drag the drawer. The background and app shell use stack snapshot props so styles stay coordinated.
      </p>
      <button v-bind="api.getTriggerProps()" :class="styles.button">Open Drawer</button>
    </div>

    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
        </div>
        <div v-bind="api.getTitleProps()" :class="styles.title">Drawer</div>
        <div :class="styles.scrollable">
          <div v-for="index in 30" :key="index">Item {{ index }}</div>
        </div>
      </Presence>
    </div>
  </main>
</template>
